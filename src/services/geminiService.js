const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const getCoachResponse = async (userMessage, history, apiKey) => {
    if (!apiKey) {
        return "I'm ready to coach you, but I need a Gemini API Key to activate my intelligence. Please add `VITE_GEMINI_API_KEY` to your .env file.";
    }

    const systemPrompt = `You are the HYROX PREPLAB AI Coach. You are a world-class HYROX expert.
  Use the following knowledge to guide the user:
  - Progression: 12-week program (Foundation -> Strength -> Specificity -> Taper).
  - Readiness: Adjust intensity based on % (High: bonus sets, Moderate: stick to plan, Low: -20% load).
  - Stations: Focus on technique (SkiErg hinge, Sled low drive, Wall Balls break early).
  - Tone: Encouraging, elite, technical, and precise.
  
  If the user asks about a specific exercise, provide 'Pro Tips' from the library.
  Keep responses concise and mobile-friendly.`;

    const contents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...history.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
    ];

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Gemini API Error:', error);
        return "I encountered a technical glitch in my processing unit. Let's try that again in a moment.";
    }
};
