const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const AIService = {
    translate: async (text: string, targetLang: string): Promise<{ translatedText: string; detectedLang: string }> => {
        if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set");

        // System prompt to force JSON output
        const systemPrompt = `You are a helpful translation assistant.
    Translate the user's text to ${targetLang === 'es' ? 'Spanish' : 'English'}.
    Output ONLY valid JSON in this format:
    { "translatedText": "...", "detectedLanguage": "..." }
    Do not add markdown formatting or explanations.`;

        try {
            const response = await fetch(GROQ_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant", // Correct Model ID
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: text }
                    ],
                    temperature: 0.3,
                    response_format: { type: "json_object" } // Force JSON mode
                })
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Groq API Error: ${err}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            console.log("Groq Raw Response:", content);
            return JSON.parse(content);

        } catch (error: any) {
            console.error("Translation Error Details:", error);
            // Return actual error message for debugging
            return {
                translatedText: `Error: ${error.message || "Unknown Error"}`,
                detectedLang: "unknown"
            };
        }
    },

    summarize: async (conversationText: string): Promise<string> => {
        if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set");

        const systemPrompt = "You are a medical assistant. Summarize the following conversation including Symptoms, Diagnosis, and Plan. Use Markdown formatting.";

        try {
            const response = await fetch(GROQ_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: conversationText }
                    ],
                    temperature: 0.5
                })
            });

            if (!response.ok) {
                throw new Error("Groq API Summary Failed");
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error("Summary Error:", error);
            return "Failed to generate summary.";
        }
    }
};
