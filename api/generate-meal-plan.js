export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const { profile } = await req.json()

  if (!profile) {
    return new Response(JSON.stringify({ error: 'Profile is required' }), { status: 400 })
  }

  const prompt = `You are a nutrition expert creating a personalized 7-day meal plan for someone in Moldova.

User profile:
- Name: ${profile.name}
- Age: ${profile.age}
- Gender: ${profile.gender}
- Height: ${profile.height}cm
- Weight: ${profile.weight}kg
- Activity level: ${profile.activityLevel}
- Fitness goal: ${profile.goal} (lose = lose fat, maintain = maintain weight, build = build muscle)
- Meals per day: ${profile.mealsPerDay}
- Weekly budget: ${profile.budget} MDL
- Cooking skill: ${profile.cookingSkill}
- Cooking time available: ${profile.cookingTime} minutes
- Liked foods: ${profile.likedFoods || 'none specified'}
- Disliked foods: ${profile.dislikedFoods || 'none'}
- Allergies: ${profile.allergies || 'none'}
- Preferred proteins: ${profile.proteins?.join(', ') || 'any'}

Available Moldovan foods to use:
Proteins: chicken breast, chicken thighs, eggs, cottage cheese, tuna (canned), beans, beef, pork, fish, Greek yogurt, kefir
Grains: rice, buckwheat, oats, pasta, bread, potatoes, lentils
Vegetables: cabbage, carrots, tomatoes, cucumbers, onions, garlic, peppers, spinach, broccoli (frozen)
Fruits: apples, bananas, oranges
Dairy: milk, sour cream, cheese
Oils: sunflower oil

Rules:
1. ONLY use affordable foods available in Moldovan supermarkets
2. Keep meals simple unless skill is advanced
3. Respect disliked foods and allergies strictly
4. Stay within the weekly budget in MDL
5. Each meal should have realistic preparation steps
6. Calculate accurate calories and macros
7. Vary meals across the week

Calculate daily calorie target using Mifflin-St Jeor formula with activity multiplier.
Adjust for goal: lose = -400 kcal, maintain = no change, build = +300 kcal.

Respond ONLY with a valid JSON object, no other text, no markdown:
{
  "calorieTarget": number,
  "proteinTarget": number,
  "weekCost": number,
  "goal": "${profile.goal}",
  "weekPlan": [
    {
      "day": "Monday",
      "cal": number,
      "p": number,
      "c": number,
      "f": number,
      "cost": number,
      "meals": [
        {
          "type": "breakfast",
          "name": "meal name",
          "cal": number,
          "p": number,
          "c": number,
          "f": number,
          "cost": number,
          "ingredients": [
            { "food": "ingredient name", "amount": number }
          ],
          "steps": [
            "Step 1",
            "Step 2",
            "Step 3"
          ]
        }
      ]
    }
  ],
  "shoppingList": [
    {
      "id": number,
      "name": "ingredient name",
      "category": "Meat and fish|Dairy and eggs|Grains and bread|Vegetables|Fruits|Canned foods|Other",
      "amount": number,
      "unit": "g|ml|pcs",
      "estimatedPrice": number,
      "bought": false
    }
  ]
}`

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
      return new Response(JSON.stringify({ error: 'AI generation failed', details: data }), { status: 500 })
    }

    const text = data.content[0].text
    const clean = text.replace(/```json|```/g, '').trim()
    const mealPlan = JSON.parse(clean)

    return new Response(JSON.stringify(mealPlan), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate meal plan' }), { status: 500 })
  }
}