import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.ANTHROPIC_API_KEY;
console.log(`[NutriAI] Initializing Claude with key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'NOT FOUND'}`);

const client = new Anthropic({ apiKey });

/**
 * Analyze a food image using Claude Vision
 * @param {string} imageBase64 - Base64 encoded image (without data: prefix)
 * @param {string} mediaType   - e.g. 'image/jpeg'
 * @param {object} userContext - { age, gender, weightKg, heightCm, healthConditions, fitnessGoal, targets }
 * @returns {object} Parsed nutrition analysis JSON
 */
export async function analyzeFoodImage(imageBase64, mediaType, userContext, description) {
  const systemPrompt = buildSystemPrompt(userContext);

  try {
    console.log(`[Claude] Analyzing meal...`);
    
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 }
            },
            {
              type: 'text',
              text: `Analyze this meal image. Use the person's fist (if visible) to estimate portion sizes. ${description ? `Also consider the user's explicit description: "${description}".` : ''} Respond ONLY with the JSON structure specified in the system prompt. No extra text or markdown.`
            }
          ]
        }
      ]
    });

    const rawText = response.content[0].text.trim();
    
    // Strip markdown fences if Claude adds them
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    
    console.log(`[Claude] ✓ Analysis complete`);
    return JSON.parse(cleaned);
  } catch (err) {
    console.error(`[Claude] ❌ Error:`, {
      status: err?.status,
      message: err?.message?.substring(0, 200)
    });
    throw err;
  }
}

/**
 * Generate daily summary insights from multiple meals
 */
export async function generateDailySummary(meals, userContext) {
  const mealSummary = meals.map(m => ({
    type: m.mealType,
    nutrition: m.totalNutrition,
    healthScore: m.healthScore
  }));

  try {
    console.log(`[Claude] Generating daily summary...`);
    
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: `
You are a nutrition coach. The user has consumed these meals today:
${JSON.stringify(mealSummary, null, 2)}

User targets: ${JSON.stringify(userContext.targets)}
User conditions: ${userContext.healthConditions?.join(', ') || 'none'}
User goal: ${userContext.fitnessGoal}

Respond ONLY with this JSON (no markdown, no extra text):
{
  "deficiencies": ["string"],
  "suggestions": ["string"],
  "avgHealthScore": number
}
        `.trim()
        }
      ]
    });

    const raw = response.content[0].text.trim()
      .replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    
    console.log(`[Claude] ✓ Daily summary generated`);
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[Claude] ❌ Daily summary error:`, {
      status: err?.status,
      message: err?.message?.substring(0, 200)
    });
    throw err;
  }
}

function buildSystemPrompt(user) {
  return `
You are an advanced AI Nutrition Intelligence Engine.

USER CONTEXT:
- Age: ${user.age || 'unknown'}
- Gender: ${user.gender || 'unknown'}
- Weight: ${user.weightKg ? user.weightKg + 'kg' : 'unknown'}
- Height: ${user.heightCm ? user.heightCm + 'cm' : 'unknown'}
- Health Conditions: ${user.healthConditions?.join(', ') || 'none'}
- Fitness Goal: ${user.fitnessGoal || 'maintenance'}
- Daily Targets: calories=${user.targets?.calories}, protein=${user.targets?.protein}g, carbs=${user.targets?.carbs}g, fats=${user.targets?.fats}g

TASK:
1. Identify all food items in the image
2. Estimate portions using the user's fist as reference (adult fist ≈ 240ml / ~1 cup)
3. Calculate nutritional values per item
4. Generate health insights tailored to the user's context
5. Score the meal from 0-10 considering user goals and conditions
6. Provide brief, actionable coach advice

RULES:
- If image is unclear, use confidence: "low" and estimate conservatively
- If no fist visible, estimate based on plate/bowl size and note reduced accuracy
- Adjust insights based on health conditions (e.g. flag high sugar for diabetics)
- Keep coachAdvice under 60 words, friendly and practical

RESPOND ONLY WITH THIS EXACT JSON STRUCTURE:
{
  "food_items": [
    {
      "name": "string",
      "estimated_quantity": "string",
      "confidence": "low|medium|high",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fats": number,
      "fiber": number
    }
  ],
  "total_nutrition": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fats": number,
    "fiber": number
  },
  "health_insights": ["string", "string"],
  "health_score": number,
  "coach_advice": "string"
}
  `.trim();
}
