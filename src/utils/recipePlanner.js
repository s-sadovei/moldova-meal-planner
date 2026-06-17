import { recipes, getRecipesByType } from './recipeDatabase'
import { getAverageMacrosForIngredient, getAveragePriceForIngredient } from './moldovanProducts'

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
    if (ing.key === 'cottage cheese' && goal === 'lose') {
      return { ...ing, key: 'cottage cheese 0', name: 'Brânză de vaci 0%' }
    }
    if (ing.key === 'cottage cheese 9' && goal !== 'build') {
      return { ...ing, key: goal === 'lose' ? 'cottage cheese 0' : 'cottage cheese', name: goal === 'lose' ? 'Brânză de vaci 0%' : 'Brânză de vaci 4-5%' }
    }
    if (ing.key === 'cottage cheese 0' && goal !== 'lose') {
      return { ...ing, key: goal === 'build' ? 'cottage cheese 9' : 'cottage cheese', name: goal === 'build' ? 'Brânză de vaci 9%' : 'Brânză de vaci 4-5%' }
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

export const scaleRecipe = (recipe, targetCalories, goal) => {
  let scaleFactor = targetCalories / recipe.baseCalories

  const calcFromDB = (sf) => {
    const ings = swapIngredientsByGoal(
      recipe.ingredients.map(ing => ({ ...ing, amount: Math.round(ing.amount * sf) })),
      goal
    )
    let cal = 0, p = 0, c = 0, f = 0, cost = 0, hasData = false
    ings.forEach(ing => {
      const macros = getAverageMacrosForIngredient(ing.key)
      const price = getAveragePriceForIngredient(ing.key)
      if (macros) {
        hasData = true
        const r = ing.unit === 'pcs' ? ing.amount * 0.6 : ing.unit === 'scoops' ? ing.amount : ing.amount / 100
        cal += macros.cal * r
        p += macros.p * r
        c += macros.c * r
        f += macros.f * r
      }
      if (price) {
        const r = ing.unit === 'pcs' ? ing.amount : ing.unit === 'scoops' ? ing.amount : ing.amount / 100
        cost += price * r
      }
    })
    return { ings, cal, p, c, f, cost, hasData }
  }

  for (let i = 0; i < 5; i++) {
    const { cal } = calcFromDB(scaleFactor)
    if (cal === 0 || Math.abs(cal - targetCalories) < 15) break
    scaleFactor *= targetCalories / cal
  }

  const { ings, cal, p, c, f, cost, hasData } = calcFromDB(scaleFactor)

  return {
    ...recipe,
    ingredients: ings,
    steps: scaleSteps(recipe.steps, scaleFactor),
    cal: hasData ? Math.round(cal) : Math.round(targetCalories),
    p: hasData ? Math.round(p * 10) / 10 : Math.round(recipe.baseMacros.p * scaleFactor * 10) / 10,
    c: hasData ? Math.round(c * 10) / 10 : Math.round(recipe.baseMacros.c * scaleFactor * 10) / 10,
    f: hasData ? Math.round(f * 10) / 10 : Math.round(recipe.baseMacros.f * scaleFactor * 10) / 10,
    cost: Math.round(cost * 100) / 100,
  }
}

export const filterRecipes = (recipeList, profile) => {
  const blockedKeys = profile.blockedKeys || []

  const dislikes = (profile.dislikedFoods || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
  const allergies = (profile.allergies || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
  const legacyBlocked = [...dislikes, ...allergies]

  return recipeList.filter(recipe => {
    if (blockedKeys.length > 0) {
      if (recipe.ingredients.some(ing => blockedKeys.includes(ing.key))) return false
    }
    if (legacyBlocked.length > 0) {
      if (recipe.ingredients.some(ing =>
        legacyBlocked.some(b => ing.name.toLowerCase().includes(b) || ing.key.toLowerCase().includes(b))
      )) return false
    }
    return true
  })
}

const getBudgetPerMeal = (profile) => {
  const { budget, mealsPerDay } = profile
  const effectiveBudget = budget === 9999 ? 99999 : budget
  return effectiveBudget / 7 / mealsPerDay
}

const DAYS = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică']

export const generatePlanFromRecipes = (profile, favoriteRecipeIds = []) => {
  const calorieTarget = calculateCalorieTarget(profile)
  const proteinTarget = Math.round(profile.weight * 1.8)
const fatTarget = Math.round((calorieTarget * 0.25) / 9)
const carbTarget = Math.round((calorieTarget - (proteinTarget * 4) - (fatTarget * 9)) / 4)
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

const pickRecipe = (type, targetCals, budgetLimit, macroState = {}) => {
  let pool = filterRecipes(getRecipesByType(type), profile)

  const { costSoFar = 0, mealsLeft = 1, proteinSoFar = 0, fatSoFar = 0 } = macroState

const scoreRecipe = (recipe) => {
  const scaleFactor = targetCals / recipe.baseCalories
  const scaledCost = recipe.baseCost * scaleFactor
  const effectiveBudget = profile.budget === 9999 ? 99999 : profile.budget
  const budgetLeft = effectiveBudget - costSoFar
  const budgetScore = budgetLeft > 0
    ? Math.max(0, 1 - (scaledCost / (budgetLeft / mealsLeft)))
    : 0

  let baseDbCal = 0, baseDbP = 0, baseDbF = 0
  recipe.ingredients.forEach(ing => {
    const macros = getAverageMacrosForIngredient(ing.key)
    if (macros) {
      const r = ing.unit === 'pcs' ? ing.amount * 0.6 : ing.unit === 'scoops' ? ing.amount : ing.amount / 100
      baseDbCal += macros.cal * r
      baseDbP += macros.p * r
      baseDbF += macros.f * r
    }
  })
  const dbScale = baseDbCal > 0 ? targetCals / baseDbCal : scaleFactor
  const scaledP = baseDbCal > 0 ? baseDbP * dbScale : recipe.baseMacros.p * scaleFactor
  const scaledF = baseDbCal > 0 ? baseDbF * dbScale : recipe.baseMacros.f * scaleFactor

  const proteinRemaining = proteinTarget - proteinSoFar
  const fatRemaining = fatTarget - fatSoFar
  const idealP = mealsLeft > 0 ? proteinRemaining / mealsLeft : 0
  const idealF = mealsLeft > 0 ? fatRemaining / mealsLeft : 0
  const pDev = idealP > 0 ? Math.abs(scaledP - idealP) / idealP : 0
  const fDev = idealF > 0 ? Math.abs(scaledF - idealF) / idealF : 0
  const macroScore = Math.max(0, 1 - (pDev + fDev) / 3)

  return budgetScore * 0.4 + macroScore * 0.6
}

  // No budget filter here — budget correction happens after full plan is generated

const isSnack = type === 'snack'
const unusedWeekly = pool.filter(r => !usedRecipeIds[type].includes(r.id))
const unusedToday = pool.filter(r => !usedRecipeIdsToday.includes(r.id))
const unusedBoth = pool.filter(r => !usedRecipeIds[type].includes(r.id) && !usedRecipeIdsToday.includes(r.id))

const candidates = isSnack
  ? (unusedToday.length > 0 ? unusedToday : pool)
  : (unusedBoth.length > 0 ? unusedBoth : unusedWeekly.length > 0 ? unusedWeekly : getRecipesByType(type))

if (candidates.length === 0) return null

// Try to pick a favorite first if under 3x usage
const availableFavorites = candidates.filter(r =>
  favoriteRecipeIds.includes(r.id) &&
  (favoriteUsageCount[r.id] || 0) < 3
)

// Score all candidates
const scored = candidates
  .map(r => ({ recipe: r, score: scoreRecipe(r) }))
  .sort((a, b) => b.score - a.score)

// Pick from top third for variety, but bias toward favorites
const topThird = scored.slice(0, Math.max(1, Math.floor(scored.length / 3)))
const topThirdRecipes = topThird.map(s => s.recipe)

const favoritesInTop = topThirdRecipes.filter(r =>
  favoriteRecipeIds.includes(r.id) &&
  (favoriteUsageCount[r.id] || 0) < 3
)

const pickPool = favoritesInTop.length > 0 ? favoritesInTop : topThirdRecipes
const picked = pickPool[Math.floor(Math.random() * pickPool.length)]

  usedRecipeIds[type].push(picked.id)
usedRecipeIdsToday.push(picked.id)
if (favoriteRecipeIds.includes(picked.id)) {
    favoriteUsageCount[picked.id] = (favoriteUsageCount[picked.id] || 0) + 1
  }

  return picked
}

  const weekPlan = DAYS.map((day, dayIndex) => {
  usedRecipeIdsToday.length = 0
  let dayCostSoFar = 0
  let dayProteinSoFar = 0
  let dayFatSoFar = 0
  const meals = mealTypes.map((type, mealIndex) => {
      const targetCals = getCaloriesForType(type, calorieTarget, mealsPerDay)
      const recipe = pickRecipe(type, targetCals, budgetPerMeal, {
  costSoFar: dayCostSoFar,
  mealsLeft: mealTypes.length - mealIndex,
  proteinSoFar: dayProteinSoFar,
  fatSoFar: dayFatSoFar,
})

      if (!recipe) return null

      const useFixed = recipe.fixed && Math.abs(recipe.baseCalories - targetCals) / targetCals <= 0.15
      const scaled = useFixed ? {
  ...recipe,
  ingredients: swapIngredientsByGoal(recipe.ingredients, profile.goal),
  cal: recipe.baseCalories,
  p: recipe.baseMacros.p,
  c: recipe.baseMacros.c,
  f: recipe.baseMacros.f,
  cost: recipe.baseCost,
} : scaleRecipe(recipe, targetCals, profile.goal)

      dayCostSoFar += scaled.cost
      dayProteinSoFar += scaled.p
      dayFatSoFar += scaled.f

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

  const effectiveBudget = profile.budget === 9999 ? 99999 : profile.budget
let finalWeekCost = Math.round(weekPlan.reduce((s, d) => s + d.cost, 0) * 100) / 100

// Try to bring plan within budget up to 5 times
// Pre-calculate real costs for all recipes by type
const realCostCache = {}
const allTypes = ['breakfast', 'lunch', 'dinner', 'snack']
allTypes.forEach(type => {
  const targetCals = getCaloriesForType(type, calorieTarget, mealsPerDay)
  realCostCache[type] = filterRecipes(getRecipesByType(type), profile)
    .map(r => {
      const useFixed = r.fixed && Math.abs(r.baseCalories - targetCals) / targetCals <= 0.15
      const scaled = useFixed ? {
        ...r,
        ingredients: swapIngredientsByGoal(r.ingredients, profile.goal),
        cost: r.baseCost,
        cal: r.baseCalories,
        p: r.baseMacros.p,
        c: r.baseMacros.c,
        f: r.baseMacros.f,
      } : scaleRecipe(r, targetCals, profile.goal)
      return { recipe: r, scaled, realCost: scaled.cost }
    })
    .sort((a, b) => a.realCost - b.realCost)
})

const buildMealEntry = (existing, recipe, scaled) => ({
  id: existing.id,
  recipeId: recipe.id,
  name: scaled.name,
  type: existing.type,
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
})

let attempts = 0
while (finalWeekCost > effectiveBudget && attempts < 20) {
  attempts++

  // Find the single most expensive meal in the entire week
  let mostExpensiveMeal = null
  let mostExpensiveDay = null
  let mostExpensiveMealIndex = -1

  weekPlan.forEach(day => {
    day.meals.forEach((meal, mealIndex) => {
      if (!mostExpensiveMeal || meal.cost > mostExpensiveMeal.cost) {
        mostExpensiveMeal = meal
        mostExpensiveDay = day
        mostExpensiveMealIndex = mealIndex
      }
    })
  })

  if (!mostExpensiveMeal) break

  const type = mostExpensiveMeal.type
  const sortedByRealCost = realCostCache[type]

  // Filter to only recipes cheaper than current meal
  const cheaperOptions = sortedByRealCost.filter(
    entry => entry.realCost < mostExpensiveMeal.cost * 0.95 &&
    entry.recipe.id !== mostExpensiveMeal.recipeId
  )

  if (cheaperOptions.length === 0) break

  // Pick randomly from cheapest third for variety
  const cheapestThird = cheaperOptions.slice(0, Math.max(1, Math.floor(cheaperOptions.length / 3)))
  const picked = cheapestThird[Math.floor(Math.random() * cheapestThird.length)]

  mostExpensiveDay.meals[mostExpensiveMealIndex] = buildMealEntry(mostExpensiveMeal, picked.recipe, picked.scaled)
  mostExpensiveDay.cal = mostExpensiveDay.meals.reduce((s, m) => s + m.cal, 0)
  mostExpensiveDay.p = Math.round(mostExpensiveDay.meals.reduce((s, m) => s + m.p, 0) * 10) / 10
  mostExpensiveDay.c = Math.round(mostExpensiveDay.meals.reduce((s, m) => s + m.c, 0) * 10) / 10
  mostExpensiveDay.f = Math.round(mostExpensiveDay.meals.reduce((s, m) => s + m.f, 0) * 10) / 10
  mostExpensiveDay.cost = Math.round(mostExpensiveDay.meals.reduce((s, m) => s + m.cost, 0) * 100) / 100

  finalWeekCost = Math.round(weekPlan.reduce((s, d) => s + d.cost, 0) * 100) / 100
}

const budgetWarning = finalWeekCost > effectiveBudget

return {
  calorieTarget,
  proteinTarget,
  weekCost: finalWeekCost,
  goal: profile.goal,
  weekPlan,
  budgetWarning,
}
}