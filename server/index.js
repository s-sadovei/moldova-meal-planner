const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

app.post('/generate-meal-plan', async (req, res) => {
  const { profile, ingredientMacros } = req.body

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing API key' })
  }

  const prompt = `Create a 7-day meal plan. User: ${profile.gender}, ${profile.age}y, ${profile.weight}kg, ${profile.height}cm, ${profile.activityLevel}, goal:${profile.goal}, budget:${profile.budget}MDL/week, ${profile.mealsPerDay} meals/day. No:${profile.dislikedFoods||'none'}. Allergies:${profile.allergies||'none'}. Like:${profile.likedFoods||'any'}.

CRITICAL RULES:
1. Each day MUST have EXACTLY ${profile.mealsPerDay} meals. No more, no less.
2. Meal types: ${profile.mealsPerDay === 2 ? 'lunch, dinner' : profile.mealsPerDay === 3 ? 'breakfast, lunch, dinner' : profile.mealsPerDay === 4 ? 'breakfast, lunch, dinner, snack' : 'breakfast, morning snack, lunch, afternoon snack, dinner'}.
3. EGGS: amount = number of whole eggs (not grams). 1 egg = 78 kcal, 6g protein.
4. Minimum amounts: chicken 150g, rice 80g, buckwheat 80g, oats 80g, milk 200ml, kefir 200ml, cottage cheese 150g, tuna 100g, bread 60g, potatoes 150g.
5. Foods to NEVER use: ${profile.dislikedFoods || 'none'}.
6. Allergies to NEVER include: ${profile.allergies || 'none'}.
7. Prioritize these foods: ${profile.likedFoods || 'any'}.

Use ONLY these ingredients with their EXACT macros per 100g (use these numbers, do not estimate):
${ingredientMacros ? Object.entries(ingredientMacros).map(([name, m]) => 
  `- ${name}: ${m.cal} kcal, ${m.p}g protein, ${m.c}g carbs, ${m.f}g fat`
).join('\n') : 'chicken breast, eggs, cottage cheese, tuna, rice, buckwheat, oats, potatoes, cabbage, carrots, tomatoes, bananas, milk, kefir, bread, beans'}

Calculate daily calorie target using Mifflin-St Jeor + activity multiplier. Goal: lose=-400kcal, maintain=0, build=+300kcal.
For each meal, calculate calories by multiplying the exact macro values above by the ingredient amounts. Do NOT estimate - use only the provided macro values.

For cooking steps: write detailed specific instructions with exact amounts, temperatures and times. Minimum 4 steps per meal.

Return ONLY valid JSON, no markdown:
{"calorieTarget":0,"proteinTarget":0,"weekCost":0,"goal":"${profile.goal}","weekPlan":[{"day":"Monday","cal":0,"p":0,"c":0,"f":0,"cost":0,"meals":[{"type":"breakfast","name":"","cal":0,"p":0,"c":0,"f":0,"cost":0,"ingredients":[{"food":"","amount":0}],"steps":["","",""]}]}],"shoppingList":[{"id":0,"name":"","category":"Grains and bread","amount":0,"unit":"g","estimatedPrice":0,"bought":false}]}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 16000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
console.log('Anthropic response status:', response.status)
console.log('Anthropic response:', JSON.stringify(data).slice(0, 500))

if (!response.ok) {
  console.error('AI failed:', data)
  return res.status(500).json({ error: 'AI failed', details: data })
}

    const text = data.content[0].text
    const clean = text.replace(/```json|```/g, '').trim()
    const mealPlan = JSON.parse(clean)

    return res.status(200).json(mealPlan)

  } catch (error) {
    console.error('Error details:', error.message, error.stack)
    return res.status(500).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))