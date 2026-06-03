export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { profile } = req.body

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing API key' })
  }

  const prompt = `Create a 7-day meal plan for: ${profile.gender}, ${profile.age}y, ${profile.weight}kg, ${profile.height}cm, ${profile.activityLevel} activity, goal: ${profile.goal}, budget: ${profile.budget} MDL/week.

CRITICAL RULES:
1. Each day MUST have EXACTLY ${profile.mealsPerDay} meals. No more, no less.
2. Meal types: ${profile.mealsPerDay === 2 ? 'lunch, dinner' : profile.mealsPerDay === 3 ? 'breakfast, lunch, dinner' : profile.mealsPerDay === 4 ? 'breakfast, lunch, dinner, snack' : 'breakfast, morning snack, lunch, afternoon snack, dinner'}.
3. EGGS: Always use whole eggs. Amount means NUMBER OF EGGS not grams. 1 egg = 78 kcal, 6g protein. Never use less than 1 egg.
4. Minimum amounts: chicken 150g, rice 80g, buckwheat 80g, oats 80g, milk 200ml, kefir 200ml, cottage cheese 150g, tuna 100g, bread 60g, potatoes 150g.
5. Foods to NEVER use: ${profile.dislikedFoods || 'none'}.
6. Allergies to NEVER include: ${profile.allergies || 'none'}.
7. Prioritize these foods when possible: ${profile.likedFoods || 'any'}.

Use only affordable Moldovan foods: chicken breast, eggs, cottage cheese, tuna, rice, buckwheat, oats, potatoes, cabbage, carrots, tomatoes, bananas, milk, kefir, bread, beans.

Calculate calories using Mifflin-St Jeor + activity multiplier. Goal: lose=-400kcal, maintain=0, build=+300kcal.

For cooking steps: write detailed, specific instructions with exact amounts, temperatures and times. For example instead of "cook chicken" write "Season 150g chicken breast with salt and pepper. Heat 1 tsp sunflower oil in a pan over medium heat. Cook chicken for 6-7 minutes per side until golden brown and cooked through." Minimum 4 steps per meal.

Return ONLY valid JSON, no markdown:
{"calorieTarget":number,"proteinTarget":number,"weekCost":number,"goal":"${profile.goal}","weekPlan":[{"day":"Monday","cal":number,"p":number,"c":number,"f":number,"cost":number,"meals":[{"type":"breakfast","name":"string","cal":number,"p":number,"c":number,"f":number,"cost":number,"ingredients":[{"food":"string","amount":number}],"steps":["detailed step 1","detailed step 2","detailed step 3","detailed step 4"]}]}],"shoppingList":[{"id":number,"name":"string","category":"Meat and fish|Dairy and eggs|Grains and bread|Vegetables|Fruits|Canned foods|Other","amount":number,"unit":"g|ml|pcs","estimatedPrice":number,"bought":false}]}`

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
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(500).json({ error: 'AI failed', details: data })
    }

    const text = data.content[0].text
    const clean = text.replace(/```json|```/g, '').trim()
    const mealPlan = JSON.parse(clean)

    return res.status(200).json(mealPlan)

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}