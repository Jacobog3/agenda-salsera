import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;
const shouldRun = process.argv.includes("--run");
const limitArgument = process.argv.find((argument) => argument.startsWith("--limit="));
const limit = Math.min(Math.max(Number(limitArgument?.split("=")[1] ?? 3), 1), 10);
const models = (process.env.BENCHMARK_MODELS ?? "gemini-3-flash-preview,gemini-3.1-flash-lite,gpt-5-nano,gpt-5.4-nano")
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);

const rates = {
  "gemini-3-flash-preview": { input: 0.5, output: 3 },
  "gemini-3.1-flash-lite": { input: 0.25, output: 1.5 },
  "gpt-5-nano": { input: 0.05, output: 0.4 },
  "gpt-5.4-nano": { input: 0.2, output: 1.25 }
};

if (!url || !serviceRoleKey) {
  console.error("Missing Supabase credentials in .env.local.");
  process.exit(1);
}

if (shouldRun && !geminiApiKey) {
  console.error("Missing GEMINI_API_KEY in .env.local.");
  process.exit(1);
}

if (shouldRun && models.some((model) => model.startsWith("gpt-")) && !openAiApiKey) {
  console.error("Missing OPENAI_API_KEY in .env.local.");
  process.exit(1);
}

function cleanJsonResponse(rawText) {
  return rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
}

function usageFrom(payload, model) {
  const usage = payload?.usageMetadata ?? {};
  const inputTokens = usage.promptTokenCount ?? 0;
  const candidateTokens = usage.candidatesTokenCount ?? 0;
  const thoughtTokens = usage.thoughtsTokenCount ?? 0;
  const outputTokens = candidateTokens + thoughtTokens;
  const modelRates = rates[model];

  return {
    inputTokens,
    outputTokens,
    thoughtTokens,
    estimatedCostUsd: modelRates
      ? (inputTokens * modelRates.input + outputTokens * modelRates.output) / 1_000_000
      : null
  };
}

async function getEventPrompt() {
  const routeSource = await readFile(new URL("../src/app/api/parse-flyer/route.ts", import.meta.url), "utf8");
  const match = routeSource.match(/const EVENT_PROMPT = `([\s\S]*?)`;\n\nconst ACADEMY_PROMPT/);
  if (!match) throw new Error("Could not read EVENT_PROMPT from parse-flyer route.");
  return match[1];
}

async function fetchSamples() {
  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data, error } = await supabase
    .from("events")
    .select("id,title_es,starts_at,venue_name,city,price_text,organizer_name,dance_style,cover_image_url")
    .not("cover_image_url", "is", null)
    .neq("cover_image_url", "")
    .order("starts_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

async function imageToInlineData(imageUrl) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Image download failed (${response.status}).`);
  return {
    mimeType: response.headers.get("content-type") || "image/jpeg",
    data: Buffer.from(await response.arrayBuffer()).toString("base64")
  };
}

async function runModel(model, prompt, sample) {
  const image = await imageToInlineData(sample.cover_image_url);
  return model.startsWith("gpt-")
    ? runOpenAiModel(model, prompt, image)
    : runGeminiModel(model, prompt, image);
}

async function runGeminiModel(model, prompt, image) {
  const startedAt = Date.now();
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: image }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
          thinkingConfig: { thinkingBudget: 0 }
        }
      })
    }
  );

  if (!response.ok) {
    return {
      model,
      ok: false,
      durationMs: Date.now() - startedAt,
      error: `Gemini ${response.status}: ${await response.text()}`
    };
  }

  const payload = await response.json();
  const rawText = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text ?? "")
    .join("") ?? "";

  try {
    return {
      model,
      ok: true,
      durationMs: Date.now() - startedAt,
      usage: usageFrom(payload, model),
      output: JSON.parse(cleanJsonResponse(rawText))
    };
  } catch {
    return {
      model,
      ok: false,
      durationMs: Date.now() - startedAt,
      usage: usageFrom(payload, model),
      error: "Invalid JSON response",
      rawText
    };
  }
}

async function runOpenAiModel(model, prompt, image) {
  const startedAt = Date.now();
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          {
            type: "input_image",
            image_url: `data:${image.mimeType};base64,${image.data}`,
            detail: "high"
          }
        ]
      }],
      reasoning: { effort: model === "gpt-5-nano" ? "minimal" : "none" },
      max_output_tokens: 4096
    })
  });

  if (!response.ok) {
    return {
      model,
      ok: false,
      durationMs: Date.now() - startedAt,
      error: `OpenAI ${response.status}: ${await response.text()}`
    };
  }

  const payload = await response.json();
  const rawText = (payload.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text ?? "")
    .join("");
  const modelRates = rates[model];
  const usage = {
    inputTokens: payload.usage?.input_tokens ?? 0,
    outputTokens: payload.usage?.output_tokens ?? 0,
    thoughtTokens: payload.usage?.output_tokens_details?.reasoning_tokens ?? 0,
    estimatedCostUsd: modelRates
      ? ((payload.usage?.input_tokens ?? 0) * modelRates.input +
          (payload.usage?.output_tokens ?? 0) * modelRates.output) / 1_000_000
      : null
  };

  try {
    return {
      model,
      ok: true,
      durationMs: Date.now() - startedAt,
      usage,
      output: JSON.parse(cleanJsonResponse(rawText))
    };
  } catch {
    return {
      model,
      ok: false,
      durationMs: Date.now() - startedAt,
      usage,
      error: "Invalid JSON response",
      rawText
    };
  }
}

async function main() {
  const samples = await fetchSamples();
  const summary = samples.map((sample) => ({
    id: sample.id,
    expected: {
      title: sample.title_es,
      date: sample.starts_at,
      venue: sample.venue_name,
      city: sample.city,
      price: sample.price_text,
      organizerName: sample.organizer_name,
      danceStyle: sample.dance_style
    },
    imageUrl: sample.cover_image_url
  }));

  if (!shouldRun) {
    console.log(JSON.stringify({
      mode: "dry-run",
      models,
      samples: summary
    }, null, 2));
    console.log("\nDry run only. No Gemini requests were made. Use --run to execute the paid benchmark.");
    return;
  }

  const prompt = await getEventPrompt();
  const results = [];

  for (const sample of samples) {
    const modelResults = [];
    for (const model of models) {
      modelResults.push(await runModel(model, prompt, sample));
    }
    results.push({
      id: sample.id,
      expected: summary.find((entry) => entry.id === sample.id)?.expected,
      results: modelResults
    });
  }

  const totals = Object.fromEntries(models.map((model) => {
    const modelResults = results.flatMap((entry) => entry.results).filter((entry) => entry.model === model);
    return [model, {
      successful: modelResults.filter((entry) => entry.ok).length,
      total: modelResults.length,
      durationMs: modelResults.reduce((sum, entry) => sum + entry.durationMs, 0),
      estimatedCostUsd: modelResults.reduce(
        (sum, entry) => sum + (entry.usage?.estimatedCostUsd ?? 0),
        0
      )
    }];
  }));

  console.log(JSON.stringify({ mode: "run", models, totals, samples: results }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
