import { GoogleGenerativeAI } from "@google/generative-ai";

// ================================
// HYROX PREPLAB AI COACH PROMPTS
// Smart routing + prompt builder
// ================================

// ---------- 1. SYSTEM INSTRUCTIONS ----------
const SYSTEM = {
    FULL: `You are HYROX PREPLAB AI Coach, a world-class HYROX performance expert.

Style:
- encouraging, elite, precise
- structured and actionable
- mobile-friendly but detailed when useful

Focus:
- hybrid endurance + strength balance
- race efficiency and fatigue management
- readiness-based adjustments
- technique optimization

No medical diagnoses.

Format:
Use clean, spaced Markdown.
Use **tables** for daily plans, workouts, or comparative data (e.g., sets/reps).
Use **lists** for tips or step-by-step instructions.

Structure:
Key Insight: 
What To Do: (Use tables/lists here)
Why It Matters: 
Coach Tip: `,

    LITE: `You are HYROX PREPLAB AI Coach.

Be motivating and technical.
Prioritize actionable advice.
Adapt to readiness and training phase.
No medical diagnosis.

Format:
Focus: 
Do: 
Tip: `,

    ULTRA: `HYROX AI Coach.

Motivating and action-focused.

Format:
Focus: 
Do: 
Tip: `
};

// ---------- 2. DEVELOPER PROMPTS ----------
const DEV = {
    FULL: ({ readiness, week, session, history, message }) => `HYROX coaching knowledge:

Principles:
- mimic race flow (run + stations)
- progressive overload
- technique saves energy

Program phases:
1-4 foundation aerobic + movement
5-8 strength/power heavy sleds explosive work
9-11 race-specific combined sessions
12 taper maintain intensity reduce volume

Readiness:
85+ full intensity optional extra
60-84 follow plan quality focus
<60 reduce load ~20% prioritize recovery

Stations:
ski hips
push low steps
pull backward tight rope
burpee steady rhythm
row legs first
carry tight shoulders
lunges bag high
wallball break early

User:
readiness=${readiness ?? "unknown"}
week=${week ?? "unknown"}
session=${session ?? "unknown"}
history=${history ?? "none"}
question=${message ?? ""}

Provide detailed HYROX coaching guidance.`,

    LITE: ({ readiness, week, session, notes, message }) => `HYROX context:

Phases:
1-4 base
5-8 power
9-11 race
12 taper

Rules:
85+ push optional extra
60-84 planned quality
<60 reduce or recovery

Station cues:
ski hips
push low steps
pull tight rope
burpee rhythm
row legs
carry shoulders tight
lunges bag high
wallball break early

User:
R=${readiness ?? "?"}
W=${week ?? "?"}
S=${session ?? "?"}
N=${notes ?? "none"}
Q=${message ?? ""}

Give your coaching guidance.`,

    ULTRA: ({ readiness, week, session }) => `Phase:
1-4 base | 5-8 power | 9-11 race | 12 taper

Rules:
85+ push
60-84 normal
<60 recover/reduce

User:
R=${readiness ?? "?"}
W=${week ?? "?"}
S=${session ?? "?"}

Provide your coaching guidance.`
};

// ---------- 3. SMART ROUTING ----------
function complexityScore(msg = "") {
    let score = 0;
    const m = msg.toLowerCase();

    if (m.length > 160) score += 2;
    if (m.includes("?")) score += 1;
    if (/\b(plan|program|strategy|explain|why|compare|technique|injury|improve)\b/.test(m)) score += 2;
    if (/\b(today|status|ready|quick|summary|check)\b/.test(m)) score -= 1;

    return score;
}

export function choosePromptType(message = "", source = "chat") {
    // Source-based routing (strong signal)
    if (source === "notification") return "ULTRA";
    if (source === "daily_checkin") return "ULTRA";
    if (source === "plan_builder") return "FULL";

    const lowerMsg = message.toLowerCase().trim();
    // Re-introduce simple regex guard for true 'ultra' messages like hey/thanks
    const ultraLiteRegex = /^(hi|hello|hey|thanks|thank you|ok|okay|cool|good|morning|afternoon|evening|ready|let's go)$/;
    if (lowerMsg.length < 25 && ultraLiteRegex.test(lowerMsg.replace(/[.,!]/g, ''))) {
        return "ULTRA";
    }

    // Message complexity routing
    const score = complexityScore(message);

    if (score >= 3) return "FULL";
    if (score < 0) return "ULTRA"; // Only extremely penalized messages go to ULTRA
    return "LITE";
}

// ---------- 4. BUILD GEMINI PAYLOAD ----------
export function buildCoachPrompt({
    message = "",
    readiness,
    week,
    session,
    history,
    notes,
    source = "chat"
} = {}) {
    const type = choosePromptType(message, source);
    const systemInstruction = SYSTEM[type];
    const developerPrompt = DEV[type]({
        readiness, week, session, history, notes, message
    });

    return {
        type, // useful for logging / analytics
        systemInstruction: `${systemInstruction}\n\n${developerPrompt}`
    };
}

export const getCoachResponse = async (userMessage, history, apiKey) => {
    if (!apiKey) {
        return "I'm ready to coach you, but I need a Gemini API Key to activate my intelligence. Please add `VITE_GEMINI_API_KEY` to your .env file.";
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const promptPayload = buildCoachPrompt({
        message: userMessage,
        history: history.length > 1 ? "yes" : "no",
        source: "chat"
    });

    const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        systemInstruction: promptPayload.systemInstruction
    });

    try {
        const chatHistory = history.slice(1).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 2048,
            },
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API Error:', error);
        return "I encountered a technical glitch in my processing unit. Let's try that again in a moment.";
    }
};
