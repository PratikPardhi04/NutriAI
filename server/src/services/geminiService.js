import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import dotenv from 'dotenv';
dotenv.config();

const key1 = process.env.GEMINI_API_KEY;
const key2 = process.env.GEMINI_API_KEY_2 || key1;
const key3 = process.env.GEMINI_API_KEY_3 || key2;

if (!key1) console.error('[NutriAI] ⚠️  GEMINI_API_KEY not set');

const aiScan = new GoogleGenAI({ apiKey: key1 });
const aiReport = new GoogleGenAI({ apiKey: key2 });
const aiChat = new GoogleGenAI({ apiKey: key3 });

// Using 2.5-flash as requested
const MODEL_IMAGE = 'gemini-2.5-flash';
const MODEL_TEXT = 'gemini-2.5-flash';

// ============================================================
//  IMAGE COMPRESSION
// ============================================================
async function compressImage(imageBase64, mediaType) {
  try {
    const buffer = Buffer.from(imageBase64, 'base64');
    const compressed = await sharp(buffer)
      .resize(240, 240, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 30, mozjpeg: true })
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
async function _callGemini(client, model, contents, config = {}) {
  const response = await client.models.generateContent({ model, contents, config });
  return response.text;
}

async function callGeminiWithRetry(client, model, contents, config = {}) {
  const delays = [1000, 2000, 4000];
  let lastError;

  for (let i = 0; i <= delays.length; i++) {
    try {
      return await _callGemini(client, model, contents, config);
    } catch (err) {
      lastError = err;
      const msg = err.message?.toLowerCase() || '';
      const isRetryable = msg.includes('503') || msg.includes('overloaded') || msg.includes('busy') || msg.includes('429');
      
      if (isRetryable && i < delays.length) {
        console.warn(`[NutriAI] Gemini busy (${model}), retrying in ${delays[i]}ms... (${i + 1}/3)`);
        await new Promise(res => setTimeout(res, delays[i]));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/**
 * Failover logic using all 3 API keys
 */
async function callWithFailover(model, contents, config = {}) {
  const clients = [
    { name: "Key 1", client: aiScan },
    { name: "Key 2", client: aiReport },
    { name: "Key 3", client: aiChat }
  ];
  let lastError;

  for (const item of clients) {
    try {
      return await callGeminiWithRetry(item.client, model, contents, config);
    } catch (err) {
      lastError = err;
      const msg = err.message?.toLowerCase() || '';
      const isBusy = msg.includes('503') || msg.includes('overloaded') || msg.includes('busy') || msg.includes('429');
      
      if (isBusy && item.name !== "Key 3") {
        console.warn(`[NutriAI] ${item.name} failed (${model}), failing over to next key...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
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
  const t = u.targets || {};
  return `NutriAI. User:${u.age||'?'}y ${u.gender||'?'} ${u.weightKg||'?'}kg ${u.fitnessGoal||'maint'}. Targets: Cal:${t.calories||0} P:${t.protein||0}g C:${t.carbs||0}g F:${t.fats||0}g.
JSON: {"food_items":[{"name":"","estimated_quantity":"","confidence":"high","calories":0,"protein":0,"carbs":0,"fats":0,"fiber":0,"sugar":0}],"total_nutrition":{"calories":0,"protein":0,"carbs":0,"fats":0,"fiber":0,"sugar":0},"health_insights":[""],"health_score":0,"coach_advice":""}
Score: 0-10.`;
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
  const userText = description ? `Analyze meal. Note:${description}` : 'Analyze meal.';

  try {
    console.log(`[NutriAI] Scanning with Failover Support (${MODEL_IMAGE})...`);
    const text = await callWithFailover(
      MODEL_IMAGE,
      [{
        role: 'user', parts: [
          { inlineData: { data: img.base64, mimeType: img.mimeType } },
          { text: userText }
        ]
      }],
      { systemInstruction: buildSystemPrompt(userContext), responseMimeType: 'application/json', temperature: 0.1 }
    );
    
    const result = normalizeResult(parseJSON(text));
    if (!result || !result.total_nutrition) {
      console.warn('[NutriAI] ⚠️ Result missing total_nutrition. Raw response:', text);
    }
    return result;
  } catch (err) {
    console.error(`[NutriAI] ❌ Analysis failed:`, err.message?.substring(0, 150));
    throw new Error("We couldn't analyze this image. Please ensure it shows food clearly or try again later.");
  }
}

// ============================================================
//  generateDailySummary
// ============================================================
export async function generateDailySummary(meals, userContext) {
  const mealSummary = meals.map(m => ({ t: m.mealType, n: m.totalNutrition, s: m.healthScore }));
  const prompt = `Data:${JSON.stringify(mealSummary)} Goal:${userContext.fitnessGoal}. JSON:{"deficiencies":[],"suggestions":[],"avgScore":0}`;

  try {
    // Small delay to avoid burst limits
    await new Promise(res => setTimeout(res, 1000));
    
    console.log(`[NutriAI] Summary with Failover Support (${MODEL_TEXT})...`);
    const text = await callWithFailover(
      MODEL_TEXT,
      [{ role: 'user', parts: [{ text: prompt }] }],
      { responseMimeType: 'application/json', temperature: 0.1 }
    );
    
    const result = parseJSON(text);
    if (result && typeof result.avgScore === 'number' && result.avgScore > 10) {
      result.avgScore = Math.min(10, Math.round(result.avgScore / 10));
    }
    return result;
  } catch (err) {
    console.error(`[NutriAI] ❌ Summary failed:`, err.message?.substring(0, 150));
    return { deficiencies: [], suggestions: [], avgScore: 0 };
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
    console.log(`[CoachChat] Chat with Failover Support (${MODEL_TEXT})...`);
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Got it.' }] },
      ...chatHistory.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: userMessage }] },
    ];
    const text = await callWithFailover(MODEL_TEXT, contents, { temperature: 0.7 });
    console.log(`[CoachChat] ✓ ${MODEL_TEXT}`);
    return text;
  } catch (err) {
    console.error(`[CoachChat] ❌ Chat failed:`, err.message?.substring(0, 150));
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
}