const foods = {
  chicken: { name: 'Chicken Breast', cal: 165, p: 31, c: 0, f: 3.6, price: 45, unit: 'g', category: 'Meat and fish' },
  eggs: { name: 'Eggs', cal: 155, p: 13, c: 1.1, f: 11, price: 3, unit: 'pcs', category: 'Dairy and eggs' },
  cottage: { name: 'Cottage Cheese', cal: 98, p: 11, c: 3.4, f: 4.3, price: 18, unit: 'g', category: 'Dairy and eggs' },
  tuna: { name: 'Canned Tuna', cal: 116, p: 26, c: 0, f: 1, price: 22, unit: 'g', category: 'Canned foods' },
  rice: { name: 'Rice', cal: 130, p: 2.7, c: 28, f: 0.3, price: 8, unit: 'g', category: 'Grains and bread' },
  buckwheat: { name: 'Buckwheat', cal: 343, p: 13, c: 72, f: 3.4, price: 10, unit: 'g', category: 'Grains and bread' },
  oats: { name: 'Oats', cal: 389, p: 17, c: 66, f: 7, price: 7, unit: 'g', category: 'Grains and bread' },
  potato: { name: 'Potatoes', cal: 77, p: 2, c: 17, f: 0.1, price: 4, unit: 'g', category: 'Vegetables' },
  cabbage: { name: 'Cabbage', cal: 25, p: 1.3, c: 6, f: 0.1, price: 3, unit: 'g', category: 'Vegetables' },
  carrots: { name: 'Carrots', cal: 41, p: 0.9, c: 10, f: 0.2, price: 3, unit: 'g', category: 'Vegetables' },
  tomatoes: { name: 'Tomatoes', cal: 18, p: 0.9, c: 3.9, f: 0.2, price: 5, unit: 'g', category: 'Vegetables' },
  banana: { name: 'Banana', cal: 89, p: 1.1, c: 23, f: 0.3, price: 6, unit: 'g', category: 'Fruits' },
  beans: { name: 'Beans', cal: 347, p: 21, c: 63, f: 1.2, price: 9, unit: 'g', category: 'Canned foods' },
  bread: { name: 'Bread', cal: 265, p: 9, c: 49, f: 3.2, price: 5, unit: 'g', category: 'Grains and bread' },
  milk: { name: 'Milk', cal: 42, p: 3.4, c: 5, f: 1, price: 12, unit: 'ml', category: 'Dairy and eggs' },
  kefir: { name: 'Kefir', cal: 40, p: 3.3, c: 4.7, f: 1, price: 14, unit: 'ml', category: 'Dairy and eggs' },
}

const mealTemplates = [
  {
    name: 'Oatmeal with Banana',
    type: 'breakfast',
    ingredients: [{ food: 'oats', amount: 80 }, { food: 'banana', amount: 100 }, { food: 'milk', amount: 200 }],
  },
  {
    name: 'Scrambled Eggs with Bread',
    type: 'breakfast',
    ingredients: [{ food: 'eggs', amount: 3 }, { food: 'bread', amount: 60 }],
  },
  {
    name: 'Cottage Cheese with Banana',
    type: 'breakfast',
    ingredients: [{ food: 'cottage', amount: 200 }, { food: 'banana', amount: 100 }],
  },
  {
    name: 'Chicken with Rice',
    type: 'lunch',
    ingredients: [{ food: 'chicken', amount: 200 }, { food: 'rice', amount: 100 }, { food: 'tomatoes', amount: 100 }],
  },
  {
    name: 'Buckwheat with Chicken',
    type: 'lunch',
    ingredients: [{ food: 'buckwheat', amount: 100 }, { food: 'chicken', amount: 180 }, { food: 'carrots', amount: 80 }],
  },
  {
    name: 'Tuna with Potatoes',
    type: 'lunch',
    ingredients: [{ food: 'tuna', amount: 150 }, { food: 'potato', amount: 200 }, { food: 'cabbage', amount: 100 }],
  },
  {
    name: 'Bean Soup with Bread',
    type: 'lunch',
    ingredients: [{ food: 'beans', amount: 150 }, { food: 'carrots', amount: 80 }, { food: 'bread', amount: 60 }],
  },
  {
    name: 'Chicken with Vegetables',
    type: 'dinner',
    ingredients: [{ food: 'chicken', amount: 200 }, { food: 'cabbage', amount: 150 }, { food: 'carrots', amount: 80 }],
  },
  {
    name: 'Eggs with Potatoes',
    type: 'dinner',
    ingredients: [{ food: 'eggs', amount: 3 }, { food: 'potato', amount: 200 }, { food: 'tomatoes', amount: 100 }],
  },
  {
    name: 'Tuna with Rice',
    type: 'dinner',
    ingredients: [{ food: 'tuna', amount: 150 }, { food: 'rice', amount: 100 }, { food: 'tomatoes', amount: 80 }],
  },
  {
    name: 'Kefir with Bread',
    type: 'snack',
    ingredients: [{ food: 'kefir', amount: 250 }, { food: 'bread', amount: 40 }],
  },
  {
    name: 'Cottage Cheese',
    type: 'snack',
    ingredients: [{ food: 'cottage', amount: 150 }],
  },
]

function calcMeal(meal) {
  let cal = 0, p = 0, c = 0, f = 0, cost = 0
  meal.ingredients.forEach(({ food, amount }) => {
    const fd = foods[food]
    const ratio = amount / 100
    cal += fd.cal * ratio
    p += fd.p * ratio
    c += fd.c * ratio
    f += fd.f * ratio
    cost += fd.price * ratio
  })
  return { cal: Math.round(cal), p: Math.round(p), c: Math.round(c), f: Math.round(f), cost: Math.round(cost) }
}

function getCalorieTarget(profile) {
  const { weight, height, age, gender, activityLevel, goal } = profile
  let bmr = gender === 'female'
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5
  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 }
  let tdee = bmr * (multipliers[activityLevel] || 1.55)
  if (goal === 'lose') tdee -= 400
  if (goal === 'build') tdee += 300
  return Math.round(tdee)
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function generateMealPlan(profile) {
  const calorieTarget = getCalorieTarget(profile)
  const proteinTarget = Math.round(profile.weight * 1.8)

  const breakfasts = mealTemplates.filter(m => m.type === 'breakfast')
  const lunches = mealTemplates.filter(m => m.type === 'lunch')
  const dinners = mealTemplates.filter(m => m.type === 'dinner')
  const snacks = mealTemplates.filter(m => m.type === 'snack')

  const weekPlan = days.map((day, i) => {
    const breakfast = { ...breakfasts[i % breakfasts.length] }
    const lunch = { ...lunches[i % lunches.length] }
    const dinner = { ...dinners[i % dinners.length] }
    const snack = { ...snacks[i % snacks.length] }

    const meals = [breakfast, lunch, dinner, snack].map(meal => {
      const nutrition = calcMeal(meal)
      return { ...meal, ...nutrition }
    })

    const dayTotals = meals.reduce((acc, m) => ({
      cal: acc.cal + m.cal,
      p: acc.p + m.p,
      c: acc.c + m.c,
      f: acc.f + m.f,
      cost: acc.cost + m.cost,
    }), { cal: 0, p: 0, c: 0, f: 0, cost: 0 })

    return { day, meals, ...dayTotals }
  })

  // Build shopping list
  const totals = {}
  weekPlan.forEach(day => {
    day.meals.forEach(meal => {
      meal.ingredients.forEach(({ food, amount }) => {
        if (!totals[food]) totals[food] = { ...foods[food], totalAmount: 0 }
        totals[food].totalAmount += amount
      })
    })
  })

  const shoppingList = Object.entries(totals).map(([key, val], i) => ({
    id: i,
    name: val.name,
    category: val.category,
    amount: Math.round(val.totalAmount),
    unit: val.unit,
    estimatedPrice: Math.round((val.price * val.totalAmount) / 100),
    bought: false,
  }))

  const weekCost = shoppingList.reduce((sum, item) => sum + item.estimatedPrice, 0)

  return {
    calorieTarget,
    proteinTarget,
    weekPlan,
    shoppingList,
    weekCost,
    goal: profile.goal,
  }
}
