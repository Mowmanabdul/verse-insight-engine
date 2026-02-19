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
    const { surahName, surahNumber, versesRead, sampleVerses } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an Islamic educational assistant helping a Muslim reflect on their Quran reading in a respectful, mainstream Sunni manner.

When generating a reflection for a reading session, provide your response in the following exact format:

## Summary
Summarise the key themes and messages from the verses read in 3-4 sentences. Connect the themes together cohesively.

## Key Themes
- **[Theme 1]**: Brief explanation
- **[Theme 2]**: Brief explanation
- **[Theme 3]**: Brief explanation

## Personal Action
Suggest one concrete, actionable step the reader can take today based on what they read. Be specific and practical.

## Related Dua
Provide one relevant dua (supplication) in Arabic with its English translation that connects to the themes of the reading. Include the source if known.

## Closing Reflection
End with a brief, thoughtful reflection (2-3 sentences) that ties everything together and encourages continued engagement with the Quran.

Guidelines:
- Use respectful Islamic tone throughout
- Avoid controversial fiqh positions
- Avoid sectarian bias
- Use simple, accessible language
- Always maintain humility and say "Allah knows best" where interpretation is involved
- Do not issue fatwas
- Do not present yourself as a scholar
- No emojis`;

    const userPrompt = `Please generate a reflection for my Quran reading session.

I read from ${surahName} (Surah ${surahNumber}), covering ${versesRead} verses.

Here are some sample verses from the session:
${sampleVerses.map((v: { arabic: string; translation: string; ayahNumber: number }) => 
  `Ayah ${v.ayahNumber}:\nArabic: ${v.arabic}\nTranslation: ${v.translation}`
).join("\n\n")}`;

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
        JSON.stringify({ error: "Failed to generate reflection" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-reflection error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
