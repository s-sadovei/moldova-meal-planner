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

CRITICAL: Each day MUST have EXACTLY ${profile.mealsPerDay} meals. No more, no less.
Meal types to use: ${profile.mealsPerDay === 2 ? 'lunch, dinner' : profile.mealsPerDay === 3 ? 'breakfast, lunch, dinner' : profile.mealsPerDay === 4 ? 'breakfast, lunch, dinner, snack' : 'breakfast, morning snack, lunch, afternoon snack, dinner'}.

Foods the user likes: ${profile.likedFoods || 'no preference'}.
Foods to NEVER use: ${profile.dislikedFoods || 'none'}.
Allergies/restrictions: ${profile.allergies || 'none'}.

Use only affordable Moldovan foods: chicken, eggs, cottage cheese, tuna, rice, buckwheat, oats, potatoes, cabbage, carrots, tomatoes, bananas, milk, kefir, bread, beans. Prioritize liked foods.

Important rules for ingredients:
- Eggs must be in whole numbers minimum 1, use "pcs" unit (e.g. 2 eggs = amount: 2)
- Minimum realistic amounts: chicken 100g, rice 60g, buckwheat 60g, oats 60g, milk 150ml, kefir 150ml
- Never use amounts less than 1 for any ingredient
- Proteins should make up at least 20% of each meal's calories

Calculate calories using Mifflin-St Jeor + activity multiplier. Goal: lose=-400kcal, maintain=0, build=+300kcal.

Return ONLY valid JSON, no markdown:
{"calorieTarget":number,"proteinTarget":number,"weekCost":number,"goal":"${profile.goal}","weekPlan":[{"day":"Monday","cal":number,"p":number,"c":number,"f":number,"cost":number,"meals":[{"type":"breakfast","name":"string","cal":number,"p":number,"c":number,"f":number,"cost":number,"ingredients":[{"food":"string","amount":number}],"steps":["step1","step2"]}]}],"shoppingList":[{"id":number,"name":"string","category":"Meat and fish|Dairy and eggs|Grains and bread|Vegetables|Fruits|Canned foods|Other","amount":number,"unit":"g|ml|pcs","estimatedPrice":number,"bought":false}]}`

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