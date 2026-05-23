import { normalizeAnalysis } from "@/lib/analysis";
import { generateDecisions } from "@/lib/decision-engine";

export const runtime = "nodejs";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

const ANALYSIS_PROMPT = `You are BunaVision, a coffee quality inspection AI for export lots.
Inspect the uploaded coffee bean image and return structured JSON only.
Use visual evidence from bean shape, color, visible defects, roast consistency, and contamination risk.

Return exactly this JSON shape and no markdown:
{
  "qualityScore": number,
  "grade": "A" | "B" | "C",
  "exportReady": boolean,
  "recommendation": string,
  "defects": {
    "brokenBeans": number,
    "discoloration": number,
    "moldRisk": number,
    "unevenRoast": number
  }
}

Rules:
- qualityScore must be 0-100.
- defect numbers must be 0-100 estimated severity percentages.
- grade A is export-premium, B is commercial/export conditional, C is reject/rework.
- recommendation must be concise, professional, and operational.`;

function extractJson(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Gemini did not return JSON.");
    return JSON.parse(match[0]);
  }
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return Response.json(
        { error: "A coffee image is required." },
        { status: 400 }
      );
    }

    if (!image.type.startsWith("image/")) {
      return Response.json(
        { error: "Only image uploads can be analyzed." },
        { status: 400 }
      );
    }

    const maxBytes = 8 * 1024 * 1024;
    if (image.size > maxBytes) {
      return Response.json(
        { error: "Image must be smaller than 8 MB." },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const base64Image = buffer.toString("base64");

    const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const geminiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: ANALYSIS_PROMPT },
              {
                inline_data: {
                  mime_type: image.type,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });

    const payload = (await geminiResponse.json()) as GeminiResponse;

    if (!geminiResponse.ok) {
      return Response.json(
        {
          error:
            payload.error?.message ??
            "Gemini could not complete the inspection.",
        },
        { status: geminiResponse.status }
      );
    }

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return Response.json(
        { error: "Gemini returned an empty inspection." },
        { status: 502 }
      );
    }

    // ✅ STEP 1: STRUCTURED ANALYSIS
    const analysis = normalizeAnalysis({
      ...extractJson(text),
      timestamp: new Date().toISOString(),
    });

    // ⚙️ STEP 2: DECISION INTELLIGENCE LAYER (NEW)
    const decisions = generateDecisions(analysis);

    // 🚀 FINAL OUTPUT: ANALYSIS + DECISIONS
    return Response.json({
      analysis,
      decisions,
    });
  } catch (error) {
    console.error("Coffee analysis failed:", error);

    return Response.json(
      {
        error:
          "Unable to analyze this image. Try another clear coffee lot photo.",
      },
      { status: 500 }
    );
  }
}