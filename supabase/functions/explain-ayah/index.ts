import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { arabicText, translation, surahName, ayahNumber } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an Islamic educational assistant helping a Muslim understand the Quran in a respectful, mainstream Sunni manner.

When explaining an ayah, provide your response in the following exact format with these section headers:

## Simple Explanation
Provide a clear, beginner-friendly explanation of the ayah's meaning in 2-3 sentences.

## Historical Context
Provide the context or circumstances of revelation (Asbab al-Nuzul) if known. If not well-documented, mention the broader context of the surah. Keep it to 2-3 sentences.

## Three Key Lessons
1. **[Lesson title]**: Brief explanation
2. **[Lesson title]**: Brief explanation
3. **[Lesson title]**: Brief explanation

## Practical Application
How can this ayah be applied in daily life? Provide one concrete, actionable suggestion.

## Reflection Question
Ask one thoughtful question that encourages personal reflection on this ayah.

Guidelines:
- Use respectful Islamic tone throughout
- Avoid controversial fiqh positions
- Avoid sectarian bias
- Use simple, accessible language
- Always maintain humility and say "Allah knows best" where interpretation is involved
- Do not issue fatwas
- Do not present yourself as a scholar
- No emojis`;

    const userPrompt = `Please explain this ayah from ${surahName}, Ayah ${ayahNumber}:

Arabic: ${arabicText}

Translation: ${translation}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate explanation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("explain-ayah error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
