import { recipes, getRecipesByType } from './recipeDatabase'
import { getMaxMacrosForIngredient, getAveragePriceForIngredient } from './moldovanProducts'

const calculateCalorieTarget = (profile) => {
  const { gender, age, weight, height, activityLevel, goal } = profile

  let bmr
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  }

  const tdee = bmr * (activityMultipliers[activityLevel] || 1.55)

  const goalAdjustments = {
    lose: -400,
    maintain: 0,
    build: 300,
  }

  return Math.round(tdee + (goalAdjustments[goal] || 0))
}

const swapIngredientsByGoal = (ingredients, goal) => {
  return ingredients.map(ing => {
    if (ing.key === 'cottage cheese' && goal === 'build') {
      return { ...ing, key: 'cottage cheese 9', name: 'Brânză de vaci 9%' }
    }
    if (ing.key === 'cottage cheese 9' && goal !== 'build') {
      return { ...ing, key: 'cottage cheese', name: 'Brânză de vaci 4-5%' }
    }
    return ing
  })
}

const scaleSteps = (steps, factor) => {
  return steps.map(step =>
    step
      .replace(/(\d+(?:\.\d+)?)\s*g/g, (match, num) => `${Math.round(Number(num) * factor)}g`)
      .replace(/(\d+(?:\.\d+)?)\s*ml/g, (match, num) => `${Math.round(Number(num) * factor)}ml`)
  )
}

const scaleRecipe = (recipe, targetCalories, goal) => {
  const scaleFactor = targetCalories / recipe.baseCalories

  const scaledIngredients = recipe.ingredients.map(ing => ({
    ...ing,
    amount: Math.round(ing.amount * scaleFactor),
  }))

  const adjustedIngredients = swapIngredientsByGoal(scaledIngredients, goal)

  let cal = 0, p = 0, c = 0, f = 0, cost = 0

  adjustedIngredients.forEach(ing => {
    const macros = getMaxMacrosForIngredient(ing.key)
    const price = getAveragePriceForIngredient(ing.key)

    if (macros) {
      const ratio = ing.unit === 'pcs' ? (ing.amount * 0.78) : ing.amount / 100
      cal += macros.cal * ratio
      p += macros.p * ratio
      c += macros.c * ratio
      f += macros.f * ratio
    }

    if (price) {
      const ratio = ing.unit === 'pcs' ? ing.amount : ing.amount / 100
      cost += price * ratio
    }
  })

  return {
    ...recipe,
    ingredients: adjustedIngredients,
    steps: scaleSteps(recipe.steps, scaleFactor),
    cal: Math.round(cal),
    p: Math.round(p * 10) / 10,
    c: Math.round(c * 10) / 10,
    f: Math.round(f * 10) / 10,
    cost: Math.round(cost * 100) / 100,
  }
}

const filterRecipes = (recipeList, profile) => {
  const dislikes = (profile.dislikedFoods || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
  const allergies = (profile.allergies || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
  const blocked = [...dislikes, ...allergies]

  return recipeList.filter(recipe => {
    if (!blocked.length) return true
    return !recipe.ingredients.some(ing =>
      blocked.some(b => ing.name.toLowerCase().includes(b) || ing.key.toLowerCase().includes(b))
    )
  })
}

const getBudgetPerMeal = (profile) => {
  const { budget, mealsPerDay } = profile
  return budget / 7 / mealsPerDay
}

const DAYS = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică']

export const generatePlanFromRecipes = (profile, favoriteRecipeIds = []) => {
  const calorieTarget = calculateCalorieTarget(profile)
  const proteinTarget = Math.round(profile.weight * 1.8)
  const budgetPerMeal = getBudgetPerMeal(profile)
  const mealsPerDay = profile.mealsPerDay || 3

  const getMealTypes = (count) => {
    if (count === 2) return ['lunch', 'dinner']
    if (count === 3) return ['breakfast', 'lunch', 'dinner']
    if (count === 4) return ['breakfast', 'lunch', 'dinner', 'snack']
    return ['breakfast', 'snack', 'lunch', 'snack', 'dinner']
  }

  const mealTypes = getMealTypes(mealsPerDay)

  const getCaloriesForType = (type, dailyTarget, mealCount) => {
    if (type === 'snack') return Math.round(dailyTarget * 0.12)
    const snackCount = mealTypes.filter(t => t === 'snack').length
    const snackCalories = snackCount * Math.round(dailyTarget * 0.12)
    const mainCalories = dailyTarget - snackCalories
    if (type === 'breakfast') return Math.round(mainCalories * 0.3)
    if (type === 'lunch') return Math.round(mainCalories * 0.4)
    if (type === 'dinner') return Math.round(mainCalories * 0.3)
    return Math.round(dailyTarget / mealCount)
  }

  const usedRecipeIds = {}
mealTypes.forEach(type => { usedRecipeIds[type] = [] })
const usedRecipeIdsToday = []

  const favoriteUsageCount = {}
favoriteRecipeIds.forEach(id => { favoriteUsageCount[id] = 0 })

const pickRecipe = (type, targetCals, budgetLimit) => {
  let pool = filterRecipes(getRecipesByType(type), profile)

  pool = pool.filter(r => {
    const scaleFactor = targetCals / r.baseCalories
    const estimatedCost = r.baseCost * scaleFactor
    return estimatedCost <= budgetLimit * 1.5
  })

  const unused = pool.filter(r => !usedRecipeIds[type].includes(r.id) && !usedRecipeIdsToday.includes(r.id))
const candidates = unused.length > 0 ? unused : pool.filter(r => !usedRecipeIdsToday.includes(r.id)).length > 0 ? pool.filter(r => !usedRecipeIdsToday.includes(r.id)) : pool

if (candidates.length === 0) return null

  // Try to pick a favorite first if under 3x usage
  const availableFavorites = candidates.filter(r =>
    favoriteRecipeIds.includes(r.id) &&
    (favoriteUsageCount[r.id] || 0) < 3
  )

  const picked = availableFavorites.length > 0
    ? availableFavorites[Math.floor(Math.random() * availableFavorites.length)]
    : candidates[Math.floor(Math.random() * candidates.length)]

  uusedRecipeIds[type].push(picked.id)
usedRecipeIdsToday.push(picked.id)
if (favoriteRecipeIds.includes(picked.id)) {
    favoriteUsageCount[picked.id] = (favoriteUsageCount[picked.id] || 0) + 1
  }

  return picked
}

  const weekPlan = DAYS.map((day, dayIndex) => {
  usedRecipeIdsToday.length = 0
  const meals = mealTypes.map((type, mealIndex) => {
      const targetCals = getCaloriesForType(type, calorieTarget, mealsPerDay)
      const recipe = pickRecipe(type, targetCals, budgetPerMeal)

      if (!recipe) return null

      const scaled = recipe.fixed ? {
        ...recipe,
        ingredients: swapIngredientsByGoal(recipe.ingredients, profile.goal),
        cal: recipe.baseCalories,
        p: recipe.baseMacros.p,
        c: recipe.baseMacros.c,
        f: recipe.baseMacros.f,
        cost: recipe.baseCost,
      } : scaleRecipe(recipe, targetCals, profile.goal)

      return {
  id: `${day}_${mealIndex}`,
  recipeId: recipe.id,
  name: scaled.name,
  type,
        cal: scaled.cal,
        p: scaled.p,
        c: scaled.c,
        f: scaled.f,
        cost: scaled.cost,
        ingredients: scaled.ingredients.map(ing => ({
          food: ing.key,
          amount: ing.amount,
          unit: ing.unit,
          key: ing.key,
          displayName: ing.name,
        })),
        steps: scaled.steps,
      }
    }).filter(Boolean)

    const dayCal = meals.reduce((s, m) => s + m.cal, 0)
    const dayP = Math.round(meals.reduce((s, m) => s + m.p, 0) * 10) / 10
    const dayC = Math.round(meals.reduce((s, m) => s + m.c, 0) * 10) / 10
    const dayF = Math.round(meals.reduce((s, m) => s + m.f, 0) * 10) / 10
    const dayCost = Math.round(meals.reduce((s, m) => s + m.cost, 0) * 100) / 100

    return { day, cal: dayCal, p: dayP, c: dayC, f: dayF, cost: dayCost, meals }
  })

  const weekCost = Math.round(weekPlan.reduce((s, d) => s + d.cost, 0) * 100) / 100

  return {
    calorieTarget,
    proteinTarget,
    weekCost,
    goal: profile.goal,
    weekPlan,
  }
}