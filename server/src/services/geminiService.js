import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import dotenv from 'dotenv';
dotenv.config();

const geminiKey = process.env.GEMINI_API_KEY;
console.log(`[NutriAI] Gemini key: ${geminiKey ? geminiKey.substring(0, 10) + '...' : 'NOT FOUND ⚠️'}`);

const ai = new GoogleGenAI({ apiKey: geminiKey });
const MODEL = 'gemini-2.5-flash';

// ============================================================
//  IMAGE COMPRESSION
// ============================================================
async function compressImage(imageBase64, mediaType) {
  try {
    const buffer = Buffer.from(imageBase64, 'base64');
    const compressed = await sharp(buffer)
      .resize(480, 480, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 60 })
      .toBuffer();
    console.log(`[NutriAI] Image: ${(buffer.length / 1024).toFixed(0)}KB → ${(compressed.length / 1024).toFixed(0)}KB`);
    return { base64: compressed.toString('base64'), mimeType: 'image/jpeg' };
  } catch (err) {
    console.warn('[NutriAI] Compression failed, using original:', err.message);
    return { base64: imageBase64, mimeType: mediaType };
  }
}

// ============================================================
//  HELPERS
// ============================================================
async function callGemini(contents, config = {}) {
  const response = await ai.models.generateContent({ model: MODEL, contents, config });
  return response.text;
}

function parseJSON(raw) {
  if (!raw) throw new Error('Empty response');
  let cleaned = raw.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  try { return JSON.parse(cleaned); } catch (_) { }

  // Try to repair truncated JSON
  let fixed = cleaned.replace(/,\s*$/, '');
  if ((fixed.match(/"/g) || []).length % 2 !== 0) fixed += '"';
  const openBrackets = (fixed.match(/\[/g) || []).length - (fixed.match(/]/g) || []).length;
  const openBraces = (fixed.match(/{/g) || []).length - (fixed.match(/}/g) || []).length;
  for (let i = 0; i < openBrackets; i++) fixed += ']';
  for (let i = 0; i < openBraces; i++) fixed += '}';
  return JSON.parse(fixed);
}

// ============================================================
//  PROMPTS
// ============================================================
function buildSystemPrompt(u) {
  return `You are a nutrition analyzer. User:${u.age || '?'}y ${u.gender || '?'} ${u.weightKg || '?'}kg goal:${u.fitnessGoal || 'maintenance'} targets:${u.targets?.calories || 0}cal ${u.targets?.protein || 0}g protein ${u.targets?.carbs || 0}g carbs ${u.targets?.fats || 0}g fat.
Respond ONLY with this exact JSON (no extra text):
{"food_items":[{"name":"str","estimated_quantity":"str","confidence":"high","calories":0,"protein":0,"carbs":0,"fats":0,"fiber":0,"sugar":0}],"total_nutrition":{"calories":0,"protein":0,"carbs":0,"fats":0,"fiber":0,"sugar":0},"health_insights":["str"],"health_score":0,"coach_advice":"str"}
IMPORTANT: health_score MUST be an integer between 0 and 10 (not 0–100). For example, a healthy meal scores 8, not 80.`;
}

// ============================================================
//  NORMALIZE health_score to 0–10
// ============================================================
function normalizeResult(result) {
  if (result && typeof result.health_score === 'number' && result.health_score > 10) {
    result.health_score = Math.min(10, Math.round(result.health_score / 10));
  }
  return result;
}

// ============================================================
//  analyzeFoodImage
// ============================================================
export async function analyzeFoodImage(imageBase64, mediaType, userContext, description) {
  const img = await compressImage(imageBase64, mediaType);
  const userText = `Analyze this meal.${description ? ` Notes:${description}.` : ''} Return JSON only.`;

  try {
    console.log(`[NutriAI] Analyzing with ${MODEL}...`);
    const text = await callGemini(
      [{
        role: 'user', parts: [
          { inlineData: { data: img.base64, mimeType: img.mimeType } },
          { text: userText }
        ]
      }],
      { systemInstruction: buildSystemPrompt(userContext), responseMimeType: 'application/json', temperature: 0.1 }
    );
    console.log(`[NutriAI] ✓ ${MODEL}`);
    return normalizeResult(parseJSON(text));
  } catch (err) {
    console.error(`[NutriAI] ❌ ${MODEL}:`, err.message?.substring(0, 150));
    console.warn('[NutriAI] Returning mock result');
    return getMockAnalysisResult(userContext);
  }
}

// ============================================================
//  generateDailySummary
// ============================================================
export async function generateDailySummary(meals, userContext) {
  const mealSummary = meals.map(m => ({ t: m.mealType, n: m.totalNutrition, s: m.healthScore }));
  const prompt = `Meals:${JSON.stringify(mealSummary)} Targets:${JSON.stringify(userContext.targets)} Goal:${userContext.fitnessGoal}.
Respond ONLY with this JSON: {"deficiencies":["str"],"suggestions":["str"],"avgScore":0}
IMPORTANT: avgScore MUST be between 0 and 10.`;

  try {
    console.log(`[NutriAI] Summary with ${MODEL}...`);
    const text = await callGemini(
      [{ role: 'user', parts: [{ text: prompt }] }],
      { responseMimeType: 'application/json', temperature: 0.1 }
    );
    console.log(`[NutriAI] ✓ Summary ${MODEL}`);
    const result = parseJSON(text);
    if (result && typeof result.avgScore === 'number' && result.avgScore > 10) {
      result.avgScore = Math.min(10, Math.round(result.avgScore / 10));
    }
    return result;
  } catch (err) {
    console.error(`[NutriAI] ❌ ${MODEL} summary:`, err.message?.substring(0, 150));
    console.warn('[NutriAI] Returning mock summary');
    return getMockDailySummary(userContext);
  }
}

// ============================================================
//  generateCoachChatResponse
// ============================================================
export async function generateCoachChatResponse(userMessage, userContext, chatHistory = []) {
  const systemPrompt = `You are Coach Alex, a gym coach and dietitian assistant inside a nutrition app.

CRITICAL RULE — MATCH THE USER'S ENERGY AND INTENT:
- If they say "hey", "hi", "hello" or small talk → just greet back naturally, 1-2 sentences max. Do NOT mention their diet, goals, or data at all.
- If they ask one specific question → answer ONLY that question. Nothing more.
- If they ask for advice → give focused advice on exactly what they asked. Don't add unrelated tips.
- Never volunteer diet analysis, macro breakdowns, or nutrition lectures unless they specifically ask for it.
- Think of yourself like ChatGPT or Gemini — you respond to what's asked, not what you think they should hear.

RESPONSE STYLE:
- Short and conversational by default. Long responses only when the user asks something detailed.
- No bullet points for simple answers — just talk naturally.
- Use bullet points or structure only when explaining something complex (like a meal plan or workout advice).
- Friendly, real, human tone. Not robotic, not overly enthusiastic.

YOUR BACKGROUND (use only when relevant):
- Certified gym coach and dietitian
- Expert in: fat loss, muscle gain, macros, meal timing, supplements, workout nutrition
- User's goal: ${userContext.fitnessGoal}
- User's targets: ${userContext.targets?.calories || 0} kcal, ${userContext.targets?.protein || 0}g protein, ${userContext.targets?.carbs || 0}g carbs, ${userContext.targets?.fats || 0}g fat
- Health conditions: ${userContext.healthConditions || 'none'}
- Weekly stats: ${JSON.stringify(userContext.stats?.weekly)}
- Monthly stats: ${JSON.stringify(userContext.stats?.monthly)}
- Recent meals: ${JSON.stringify(userContext.recentMeals)}

Only reference the user's stats/data if they ask about their progress or patterns. Otherwise, just answer what they asked.
Never say "Based on your data..." unless they asked you to look at their data.
No medical diagnoses or prescription medication advice.`;

  try {
    console.log(`[CoachChat] ${MODEL}...`);
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Got it.' }] },
      ...chatHistory.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: userMessage }] },
    ];
    const text = await callGemini(contents, { temperature: 0.7 });
    console.log(`[CoachChat] ✓ ${MODEL}`);
    return text;
  } catch (err) {
    console.error(`[CoachChat] ❌ ${MODEL}:`, err.message?.substring(0, 150));
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
}

// ============================================================
//  Mock fallbacks
// ============================================================
export function getMockAnalysisResult(userContext) {
  return {
    food_items: [
      { name: "Paneer Curry", estimated_quantity: "1 serving (~200g)", confidence: "high", calories: 280, protein: 18, carbs: 12, fats: 18, fiber: 2, sugar: 4 },
      { name: "Vegetable Curry", estimated_quantity: "1 serving (~200g)", confidence: "high", calories: 250, protein: 20, carbs: 15, fats: 12, fiber: 3, sugar: 5 },
      { name: "Dal", estimated_quantity: "1 serving (~150g)", confidence: "high", calories: 140, protein: 6, carbs: 18, fats: 5, fiber: 4, sugar: 3 },
      { name: "Yogurt Raita", estimated_quantity: "1 serving (~100g)", confidence: "high", calories: 120, protein: 8, carbs: 10, fats: 4, fiber: 2, sugar: 2 },
      { name: "Basmati Rice", estimated_quantity: "1 cup (~180g)", confidence: "high", calories: 288, protein: 5, carbs: 62, fats: 1, fiber: 2, sugar: 0 },
      { name: "Naan Bread", estimated_quantity: "1-2 pieces (~100g)", confidence: "high", calories: 280, protein: 8, carbs: 48, fats: 7, fiber: 1.5, sugar: 3 },
    ],
    total_nutrition: { calories: 1358, protein: 65, carbs: 165, fats: 47, fiber: 14.5, sugar: 17 },
    health_insights: [
      "Good protein balance from multiple sources",
      "High fiber content promotes digestive health",
      "Turmeric and spices provide anti-inflammatory benefits",
      "Yogurt adds probiotics for gut health",
    ],
    health_score: 8,
    coach_advice: "Solid meal! Watch the carb load from rice + naan together — pick one if you're cutting.",
  };
}

function getMockDailySummary(userContext) {
  return {
    deficiencies: [
      "Protein — under your daily target, add a protein source to your next meal",
      "Fiber — include more vegetables and whole grains",
      "Micronutrients — low on Vitamin C and Calcium today",
    ],
    suggestions: [
      "Add a post-workout protein shake or Greek yogurt to hit your protein target",
      "Swap refined carbs for complex ones — brown rice, oats, sweet potato",
      "Drink at least 3L of water today to support metabolism and recovery",
      "A 20–30 min walk after your biggest meal helps with insulin sensitivity",
    ],
    avgScore: 5,
  };
}