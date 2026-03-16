import { env } from "@/lib/utils/env";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

type TranslationMapping<T extends Record<string, unknown>> = {
  sourceKey: keyof T;
  targetKey: keyof T;
  label: string;
};

function applyFallback<T extends Record<string, unknown>>(
  input: T,
  mappings: TranslationMapping<T>[]
): T {
  const next = { ...input };

  for (const mapping of mappings) {
    const source = String(input[mapping.sourceKey] ?? "").trim();
    const target = String(input[mapping.targetKey] ?? "").trim();
    if (source && !target) {
      next[mapping.targetKey] = source as T[keyof T];
    }
  }

  return next;
}

export async function autoTranslateSpanishFields<T extends Record<string, unknown>>(
  input: T,
  mappings: TranslationMapping<T>[],
  options?: { force?: boolean }
): Promise<T> {
  const pending = mappings.filter((mapping) => {
    const source = String(input[mapping.sourceKey] ?? "").trim();
    const target = String(input[mapping.targetKey] ?? "").trim();
    return Boolean(source) && (options?.force || !target);
  });

  if (pending.length === 0) {
    return input;
  }

  if (!env.geminiApiKey) {
    return applyFallback(input, pending);
  }

  const payload = Object.fromEntries(
    pending.map((mapping) => [String(mapping.sourceKey), String(input[mapping.sourceKey] ?? "").trim()])
  );

  const prompt = `Translate the following Spanish content into natural English for a public website about dance events in Guatemala.

Rules:
- Return ONLY a valid JSON object.
- Preserve proper nouns, venue names, URLs, prices, and formatting intent.
- Keep titles concise and descriptions natural.
- Do not invent information.

Fields to translate:
${pending.map((mapping) => `- ${String(mapping.sourceKey)}: ${mapping.label}`).join("\n")}

Input JSON:
${JSON.stringify(payload, null, 2)}

Return JSON with these exact target keys:
${pending.map((mapping) => `- ${String(mapping.targetKey)}`).join("\n")}`;

  try {
    const response = await fetch(`${GEMINI_URL}?key=${env.geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          thinkingConfig: { thinkingBudget: 0 }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[auto-translate] Gemini error:", response.status, errorText);
      return applyFallback(input, pending);
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned) as Record<string, string>;
    const next = { ...input };

    for (const mapping of pending) {
      const translated = String(parsed[String(mapping.targetKey)] ?? "").trim();
      const source = String(input[mapping.sourceKey] ?? "").trim();
      next[mapping.targetKey] = (translated || source) as T[keyof T];
    }

    return next;
  } catch (error) {
    console.error("[auto-translate] Failed to translate fields:", error);
    return applyFallback(input, pending);
  }
}
