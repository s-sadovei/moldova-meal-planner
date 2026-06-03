export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  if (req.method !== 'POST') const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) {
  return new Response(JSON.stringify({ error: 'Missing API key', env: Object.keys(process.env) }), { status: 500 })
}{
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const { profile } = await req.json()

  const prompt = `Create a 7-day meal plan for: ${profile.gender}, ${profile.age}y, ${profile.weight}kg, ${profile.height}cm, ${profile.activityLevel} activity, goal: ${profile.goal}, budget: ${profile.budget} MDL/week, ${profile.mealsPerDay} meals/day. Dislikes: ${profile.dislikedFoods || 'none'}. Allergies: ${profile.allergies || 'none'}.

Use only affordable Moldovan foods: chicken, eggs, cottage cheese, tuna, rice, buckwheat, oats, potatoes, cabbage, carrots, tomatoes, bananas, milk, kefir, bread, beans.

Calculate calories using Mifflin-St Jeor + activity multiplier. Goal adjustments: lose=-400, maintain=0, build=+300.

Return ONLY valid JSON, no markdown:
{"calorieTarget":number,"proteinTarget":number,"weekCost":number,"goal":"${profile.goal}","weekPlan":[{"day":"Monday","cal":number,"p":number,"c":number,"f":number,"cost":number,"meals":[{"type":"breakfast","name":"string","cal":number,"p":number,"c":number,"f":number,"cost":number,"ingredients":[{"food":"string","amount":number}],"steps":["step1","step2"]}]}],"shoppingList":[{"id":number,"name":"string","category":"Meat and fish|Dairy and eggs|Grains and bread|Vegetables|Fruits|Canned foods|Other","amount":number,"unit":"g|ml|pcs","estimatedPrice":number,"bought":false}]}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'AI failed', details: data }), { status: 500 })
    }

    const text = data.content[0].text
    const clean = text.replace(/```json|```/g, '').trim()
    const mealPlan = JSON.parse(clean)

    return new Response(JSON.stringify(mealPlan), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}