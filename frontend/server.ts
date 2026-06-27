import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing json requests
app.use(express.json());

// Initialize Gemini client lazily/safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not defined. Using smart pre-planned feedback system fallback.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST Api endpoints
app.post("/api/generate-plan", async (req, res) => {
  const { stressLevel, tasks } = req.body;
  const stress = parseFloat(stressLevel) || 0.0;
  const taskList = Array.isArray(tasks) ? tasks : [];

  // Generate a fallback preview response in case Gemini API key is missing or calls fail.
  const taskSummary = taskList.map((t: any) => `- ${t.title} [Priority: ${t.priority}, Mastery: ${t.mastery}%]`).join("\n");
  const fallbackPlan = `### NEURAL COGNITIVE READOUT [FALLBACK]
**Status:** ${stress > 0.7 ? "CRITICAL FOCUS REDISTRIBUTION REQUIRED" : "BALANCED DEEP WORK ENVIRONMENT ACTIVE"}
**Stress Coefficient:** ${(stress * 100).toFixed(0)}%
**Immediate Recommendations:**
${stress > 0.7 
  ? "1. DECREASE BIOMETRIC STRAIN: Engage 4-7-8 deep breathing protocols instantly.\n2. PRIORITY RE-TUNING: Postpone low priority items; isolate high-mastery challenges first to restore micro-confidence.\n3. COGNITIVE REBOOT: Step away from display modules for 180 seconds."
  : "1. COPTIC FOCUS SESSIONS: Ignite a standard 25-minute Deep-Work Pomodoro cycle.\n2. MASTERY EXPANSION: Attack your highest priority tasks with steady cognitive load.\n3. CONTINUOUS HARMONY: The stellar current alignment supports complex mathematical or programmatic reasoning."
}

**Tactical Task Map:**
${taskSummary || "- No tracking modules found in active task registry. Deploy fresh tasks to initialize matrix maps."}
`;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.json({ plan: fallbackPlan, isFallback: true });
    }

    const client = getGeminiClient();
    const prompt = `You are the Neural Workspace Virtual Assistant, built to optimize student learning and manage high stress level coefficients.
Current User Biometric Readout:
- Stress Strain Level Coefficient: ${stress.toFixed(2)} (on a 0.0 to 1.0 spectrum where 0.0 is calm flow, 1.0 is extreme stress/burnout target).
- Stress State Label: ${stress > 0.7 ? "VIBRANT SOLAR ORANGE (STRESSED)" : "LUMINOUS CYAN BLUE (CALM/FOCUSED)"}

Active Floating Tasks in the Zero-G Matrix:
${taskList.length > 0 ? taskSummary : "No active tasks in the registry right now."}

Write a strategic, highly customized, futuristic-looking mental action plan and technical study strategy (in Markdown). Keep it extremely concise and dense (max 15 lines). It MUST feel like an advanced AI ship telemetry read-out or premium space station protocol system! 
Structure it into two segments:
1. BIOMETRIC EVALUATION (Reacting directly to their current stress level of ${stress.toFixed(2)})
2. RE-TACTICAL DIRECTIVES (A clear, high-yield ordering of what they should write, solve, or postpone next based on their priorities and mastery levels in active floating tasks).

Avoid generic templates. Be immersive, crisp, and futuristic! Include telemetry terminology. DO NOT use generic greeting code blocks. Keep it under 150 words.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const aiText = response.text || fallbackPlan;
    return res.json({ plan: aiText, isFallback: false });
  } catch (error: any) {
    console.error("Error invoking Gemini API:", error);
    return res.json({ plan: fallbackPlan, isFallback: true });
  }
});

// Serve static build or mount Vite development middleware
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static server route configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Neural Workspace Host operating on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Vite server configuration failure:", err);
  process.exit(1);
});
