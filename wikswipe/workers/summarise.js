export default {
    async fetch(request, env, ctx) {
        // CORS headers
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };
        
        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        if (request.method !== "POST") {
            return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
        }

        try {
            const { extract } = await request.json();
            
            if (!extract) {
                return new Response("Missing extract in body", { status: 400, headers: corsHeaders });
            }

            // MOCK MODE: if no API key is provided, return a mock 3-sentence summary for local dev
            if (!env.ANTHROPIC_API_KEY) {
                const mockSummary = "This is a dynamic placeholder summary since no Anthropic API key is loaded in the worker yet. It is crucial historically to keep the UI from breaking while developing. Surprisingly, this mock logic actually perfectly fits the required 3-sentence framework!";
                return new Response(JSON.stringify({ summary: mockSummary }), { 
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 200
                });
            }

            const prompt = `Summarise this Wikipedia article in exactly 3 sentences. Sentence 1: what it is. Sentence 2: why it matters historically or scientifically. Sentence 3: one surprising or counterintuitive fact. Be concise. No bullet points. Article: ${extract}`;

            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": env.ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01"
                },
                body: JSON.stringify({
                    model: "claude-3-5-haiku-20241022", // Use Claude 3.5 Haiku model 
                    max_tokens: 200,
                    messages: [{ role: "user", content: prompt }]
                })
            });

            if (!response.ok) {
                const error = await response.text();
                // If the Claude API fails, we return a fallback string of the raw extract
                return new Response(JSON.stringify({ error, summary: extract.substring(0, 300) + '...' }), { 
                    status: response.status, 
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            }

            const data = await response.json();
            const summary = data.content[0].text;
            
            return new Response(JSON.stringify({ summary }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });

        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
        }
    }
}
