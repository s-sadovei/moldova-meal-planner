export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const { profile } = await req.json()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing API key' }), { status: 500 })
  }

  const prompt = `Create a 7-day meal plan. Be concise. User: ${profile.gender}, ${profile.age}y, ${profile.weight}kg, ${profile.height}cm, ${profile.activityLevel}, goal:${profile.goal}, budget:${profile.budget}MDL/week, ${profile.mealsPerDay} meals/day. No:${profile.dislikedFoods||'none'}. Allergies:${profile.allergies||'none'}. Like:${profile.likedFoods||'any'}.

Rules:
- Exactly ${profile.mealsPerDay} meals per day
- Eggs: amount=number of whole eggs (not grams)
- Use: chicken,eggs,cottage cheese,tuna,rice,buckwheat,oats,potatoes,cabbage,carrots,tomatoes,bananas,milk,kefir,bread,beans
- Calories: Mifflin-St Jeor + activity(sed:1.2,light:1.375,mod:1.55,active:1.725) + goal(lose:-400,maintain:0,build:+300)
- Steps: 3-4 specific steps with amounts and times

Return ONLY JSON:
{"calorieTarget":0,"proteinTarget":0,"weekCost":0,"goal":"${profile.goal}","weekPlan":[{"day":"Monday","cal":0,"p":0,"c":0,"f":0,"cost":0,"meals":[{"type":"breakfast","name":"","cal":0,"p":0,"c":0,"f":0,"cost":0,"ingredients":[{"food":"","amount":0}],"steps":["",""]}]}],"shoppingList":[{"id":0,"name":"","category":"Grains and bread","amount":0,"unit":"g","estimatedPrice":0,"bought":false}]}`

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
        max_tokens: 7000,
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