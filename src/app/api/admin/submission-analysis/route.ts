import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/utils/env";
import {
  cleanGeminiJsonResponse,
  extractGeminiText
} from "@/lib/utils/gemini-response";
import {
  getGeminiGenerateContentUrl,
  getGeminiModel,
  logGeminiUsage
} from "@/lib/ai/gemini";
import {
  SUBMISSION_AI_VERSION,
  getReviewPriority,
  normalizeReviewSignals,
  type SubmissionType
} from "@/lib/submissions/analysis";
import { persistSubmissionMentions } from "@/lib/submissions/server";
import { findSuggestedEntityMatch } from "@/lib/admin/entity-matching";
import type { MentionEntityType } from "@/lib/submissions/analysis";

const TABLES = {
  event: "event_submissions",
  academy: "academy_submissions",
  teacher: "teacher_submissions",
  spot: "spot_submissions"
} as const;

const ADVANCED_PROMPT = `You review material submitted to an international Latin dance directory.

Return ONLY a JSON object with this exact structure:
{
  "reviewSignals": {
    "reasons": [],
    "mentions": [{
      "entityType": "professional|academy|organizer|spot|festival",
      "displayName": "",
      "roles": [],
      "affiliation": "",
      "originCity": "",
      "originCountryCode": "",
      "evidence": ""
    }],
    "eventKind": "",
    "festivalName": "",
    "festivalEditionLabel": "",
    "ambiguousFields": []
  }
}

Identify explicitly named professionals, couples, teams, academies, organizers, venues, festivals, and congresses. Distinguish a physical venue from the academy or organizer promoting an activity. Preserve roles such as teacher, performer, DJ, judge, host, organizer, or dancer. Do not invent identity, origin, affiliation, or relationships. A foreign guest workshop is not automatically a festival. Use short evidence paraphrases. If no related identity exists, return empty arrays.`;

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  return match ? { mimeType: match[1], data: match[2] } : null;
}

async function imageUrlToInlineData(imageUrl: string) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Image download failed (${response.status})`);
  const contentType = response.headers.get("content-type") || "image/jpeg";
  return {
    mimeType: contentType,
    data: Buffer.from(await response.arrayBuffer()).toString("base64")
  };
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const submissionType = String(body.submissionType ?? "") as SubmissionType;
  const submissionId = String(body.submissionId ?? "");
  const force = body.force === true;
  if (!(submissionType in TABLES) || !/^[0-9a-f-]{36}$/i.test(submissionId)) {
    return NextResponse.json({ error: "Solicitud no válida." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const table = TABLES[submissionType];
  const { data: submission, error: submissionError } = await supabase
    .from(table)
    .select("*")
    .eq("id", submissionId)
    .single();
  if (submissionError || !submission) {
    return NextResponse.json({ error: "No se encontró la solicitud." }, { status: 404 });
  }

  const sourceText = String(submission.source_text ?? "").trim();
  const imageUrl = String(submission.image_url ?? "").trim();
  const sourceHash = createHash("sha256")
    .update(`${submissionType}|${sourceText}|${imageUrl}`)
    .digest("hex");

  let reviewSignals = normalizeReviewSignals(submission.review_signals);
  const hasCachedAnalysis =
    !force &&
    submission.ai_advanced_status === "completed" &&
    submission.ai_advanced_source_hash === sourceHash &&
    submission.ai_advanced_analysis;

  if (hasCachedAnalysis) {
    reviewSignals = normalizeReviewSignals(submission.ai_advanced_analysis);
  } else {
    if (!env.geminiApiKey) {
      return NextResponse.json({ error: "Gemini no está configurado." }, { status: 503 });
    }

    const parts: Array<Record<string, unknown>> = [{ text: ADVANCED_PROMPT }];
    if (sourceText) parts.push({ text: `\n\nSubmitted text:\n${sourceText}` });
    if (imageUrl) {
      try {
        const inlineData = imageUrl.startsWith("data:")
          ? parseDataUrl(imageUrl)
          : await imageUrlToInlineData(imageUrl);
        if (inlineData) parts.push({ inlineData });
      } catch (error) {
        console.warn("[submission-analysis] Could not load image", error);
      }
    }

    if (parts.length === 1) {
      return NextResponse.json(
        { error: "Esta solicitud no conserva texto ni imagen para analizar." },
        { status: 400 }
      );
    }

    const response = await fetch(`${getGeminiGenerateContentUrl()}?key=${env.geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
          thinkingConfig: { thinkingBudget: 0 }
        }
      })
    });
    if (!response.ok) {
      await supabase.from(table).update({ ai_advanced_status: "failed" }).eq("id", submissionId);
      return NextResponse.json({ error: "La IA no pudo analizar el material." }, { status: 502 });
    }

    const geminiPayload = await response.json();
    logGeminiUsage("submission-analysis", geminiPayload);
    const candidate = extractGeminiText(geminiPayload);
    try {
      const parsed = JSON.parse(cleanGeminiJsonResponse(candidate.rawText)) as Record<string, unknown>;
      reviewSignals = normalizeReviewSignals(parsed.reviewSignals ?? parsed);
    } catch {
      await supabase.from(table).update({ ai_advanced_status: "failed" }).eq("id", submissionId);
      return NextResponse.json({ error: "No se pudo interpretar el análisis." }, { status: 502 });
    }

    await supabase.from(table).update({
      review_signals: reviewSignals,
      review_priority: getReviewPriority(reviewSignals),
      ai_advanced_status: "completed",
      ai_advanced_analysis: reviewSignals,
      ai_advanced_source_hash: sourceHash,
      ai_advanced_at: new Date().toISOString(),
      ai_basic_model: submission.ai_basic_model || getGeminiModel(),
      ai_basic_version: submission.ai_basic_version || SUBMISSION_AI_VERSION
    }).eq("id", submissionId);

    await persistSubmissionMentions(
      supabase,
      submissionType,
      submissionId,
      reviewSignals,
      "advanced_ai"
    );
  }

  const { data: mentions } = await supabase
    .from("submission_mentions")
    .select("*")
    .eq("submission_type", submissionType)
    .eq("submission_id", submissionId)
    .order("created_at");

  const enrichedMentions = [];
  for (const mention of mentions ?? []) {
    const match = await findSuggestedEntityMatch(
      supabase,
      mention.entity_type as MentionEntityType,
      mention.display_name
    );
    if (match) {
      await supabase.from("submission_mentions").update({
        suggested_match_id: match.id,
        suggested_match_name: match.name,
        match_confidence: match.confidence
      }).eq("id", mention.id);
    }
    enrichedMentions.push({ ...mention, suggestedMatch: match });
  }

  return NextResponse.json({
    ok: true,
    cached: Boolean(hasCachedAnalysis),
    reviewSignals,
    mentions: enrichedMentions
  });
}
