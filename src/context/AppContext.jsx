import { generateShoppingList } from '../utils/shoppingListGenerator'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { generatePlanFromRecipes, scaleRecipe, filterRecipes } from '../utils/recipePlanner'
import { getRecipesByType } from '../utils/recipeDatabase'
import { getBlockedKeys } from '../utils/foodExclusions'

const AppContext = createContext()

const getTodayDate = () => new Date().toISOString().split('T')[0]
const getDayIndex = () => {
  const day = new Date().getDay()
  return day === 0 ? 6 : day - 1 // Monday = 0, Sunday = 6
}
const isMonday = () => new Date().getDay() === 1
const isAfter2AM = () => new Date().getHours() >= 2

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [mealPlan, setMealPlan] = useState(null)
  const [brandPreferences, setBrandPreferences] = useState({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [eatenMeals, setEatenMeals] = useState([])
  const [showNewWeekPrompt, setShowNewWeekPrompt] = useState(false)
  const [favoriteRecipes, setFavoriteRecipes] = useState([])

  // Reload eaten meals when window gets focus
useEffect(() => {
  const handleFocus = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    const { data: eatenData } = await supabase
      .from('eaten_meals')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('eaten_date', getTodayDate())
    if (eatenData) setEatenMeals(eatenData)
  }
  window.addEventListener('focus', handleFocus)
  return () => window.removeEventListener('focus', handleFocus)
}, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadUserData(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        loadUserData(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setMealPlan(null)
        setBrandPreferences({})
        setEatenMeals([])
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserData = async (userId) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileData) {
        setProfile({
          name: profileData.name,
          age: profileData.age,
          gender: profileData.gender,
          height: profileData.height,
          weight: profileData.weight,
          activityLevel: profileData.activity_level,
          goal: profileData.goal,
          mealsPerDay: profileData.meals_per_day,
          budget: profileData.budget,
          likedFoods: profileData.liked_foods,
          dislikedFoods: profileData.disliked_foods,
          allergies: profileData.allergies,
          selectedAllergies: profileData.selected_allergies || [],
          customExclusions: profileData.custom_exclusions || [],
          blockedKeys: getBlockedKeys(profileData.selected_allergies || [], profileData.custom_exclusions || []),
        })

        const { data: planData } = await supabase
          .from('meal_plans')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (planData) {
          setMealPlan(planData.plan_data)

          // Check if Monday after 2AM and plan is from last week
          if (isMonday() && isAfter2AM()) {
            const planDate = new Date(planData.created_at)
            const daysSince = Math.floor((new Date() - planDate) / (1000 * 60 * 60 * 24))
            if (daysSince >= 7) setShowNewWeekPrompt(true)
          }
        }

        const { data: prefsData } = await supabase
          .from('brand_preferences')
          .select('*')
          .eq('user_id', userId)

        if (prefsData) {
          const prefs = {}
          prefsData.forEach(p => { prefs[p.ingredient_key] = p.product_data })
          setBrandPreferences(prefs)
        }
        
        // Load favorite recipes
const { data: favoritesData } = await supabase
  .from('favorite_recipes')
  .select('*')
  .eq('user_id', userId)

if (favoritesData) setFavoriteRecipes(favoritesData.map(f => f.recipe_id))


        // Load today's eaten meals
        const { data: eatenData } = await supabase
          .from('eaten_meals')
          .select('*')
          .eq('user_id', userId)
          .eq('eaten_date', getTodayDate())

        if (eatenData) setEatenMeals(eatenData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signup = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const saveProfile = async (profileData) => {
    const enriched = {
      ...profileData,
      blockedKeys: getBlockedKeys(profileData.selectedAllergies || [], profileData.customExclusions || []),
    }
    setProfile(enriched)
    setGenerating(true)

    const plan = generatePlanFromRecipes(enriched, favoriteRecipes)
setGenerating(false)

    const recalculatedShoppingList = generateShoppingList(plan.weekPlan)
const updatedPlan = { ...plan, shoppingList: recalculatedShoppingList }
setMealPlan(updatedPlan)

    if (user) {
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: profileData.name,
          age: profileData.age,
          gender: profileData.gender,
          height: profileData.height,
          weight: profileData.weight,
          activity_level: profileData.activityLevel,
          goal: profileData.goal,
          meals_per_day: profileData.mealsPerDay,
          budget: profileData.budget,
          liked_foods: profileData.likedFoods,
          disliked_foods: profileData.dislikedFoods,
          allergies: profileData.allergies,
          selected_allergies: profileData.selectedAllergies || [],
          custom_exclusions: profileData.customExclusions || [],
        })

        await supabase.from('meal_plans').upsert({
  user_id: user.id,
  plan_data: updatedPlan,
})
      } catch (error) {
        console.error('Error saving profile:', error)
      }
    }
  }

  const regeneratePlan = async () => {
    if (profile) {
      setGenerating(true)
const plan = generatePlanFromRecipes(profile, favoriteRecipes)
setGenerating(false)
      const recalculatedShoppingList = generateShoppingList(plan.weekPlan)
const updatedPlan = { ...plan, shoppingList: recalculatedShoppingList }
setMealPlan(updatedPlan)

      if (user) {
        try {
          await supabase.from('meal_plans').upsert({
  user_id: user.id,
  plan_data: updatedPlan,
})
        } catch (error) {
          console.error('Error saving regenerated plan:', error)
        }
      }

      // Clear eaten meals for the new plan
      setEatenMeals([])
      if (user) {
        await supabase.from('eaten_meals')
          .delete()
          .eq('user_id', user.id)
          .eq('eaten_date', getTodayDate())
      }
    }
  }

  const toggleShoppingItem = async (itemId) => {
  const updatedPlan = {
    ...mealPlan,
    shoppingList: mealPlan.shoppingList.map(item =>
      item.id === itemId ? { ...item, bought: !item.bought } : item
    )
  }
  setMealPlan(updatedPlan)

  if (user) {
    try {
      await supabase.from('meal_plans').upsert({
        user_id: user.id,
        plan_data: updatedPlan,
      })
    } catch (error) {
      console.error('Error saving shopping list state:', error)
    }
  }
}
const resetShoppingList = async () => {
  const updatedPlan = {
    ...mealPlan,
    shoppingList: mealPlan.shoppingList.map(item => ({ ...item, bought: false }))
  }
  setMealPlan(updatedPlan)

  if (user) {
    try {
      await supabase.from('meal_plans').upsert({
        user_id: user.id,
        plan_data: updatedPlan,
      })
    } catch (error) {
      console.error('Error resetting shopping list:', error)
    }
  }
}
const markAtHome = async (itemId) => {
  const updatedPlan = {
    ...mealPlan,
    shoppingList: mealPlan.shoppingList.map(item =>
      item.id === itemId ? { ...item, atHome: !item.atHome, bought: false } : item
    )
  }
  setMealPlan(updatedPlan)

  if (user) {
    try {
      await supabase.from('meal_plans').upsert({
        user_id: user.id,
        plan_data: updatedPlan,
      })
    } catch (error) {
      console.error('Error saving at home state:', error)
    }
  }
}

const splitShoppingItem = async (itemId, atHomeAmount) => {
  const item = mealPlan.shoppingList.find(i => i.id === itemId)
  if (!item) return

  const remainingAmount = Math.max(0, item.amount - atHomeAmount)
  const atHomeAmountFinal = Math.min(atHomeAmount, item.amount)

  const updatedShoppingList = mealPlan.shoppingList.map(i => {
    if (i.id !== itemId) return i
    return {
      ...i,
      amount: remainingAmount,
      atHomeAmount: atHomeAmountFinal,
      atHome: remainingAmount === 0,
    }
  })

  // Add separate at home entry if there's remaining to buy
  const atHomeEntry = remainingAmount > 0 ? {
    ...item,
    id: `${itemId}_home`,
    amount: atHomeAmountFinal,
    atHome: true,
    bought: false,
  } : null

  const finalList = atHomeEntry
    ? updatedShoppingList.map(i => i.id === itemId ? { ...i, amount: remainingAmount } : i).concat(atHomeEntry)
    : updatedShoppingList

  const updatedPlan = { ...mealPlan, shoppingList: finalList }
  setMealPlan(updatedPlan)

  if (user) {
    try {
      await supabase.from('meal_plans').upsert({
        user_id: user.id,
        plan_data: updatedPlan,
      })
    } catch (error) {
      console.error('Error splitting shopping item:', error)
    }
  }
}

  const saveBrandPreference = async (ingredientKey, product) => {
    setBrandPreferences(prev => ({ ...prev, [ingredientKey]: product }))

    if (user) {
      try {
        if (product === null) {
          await supabase.from('brand_preferences')
            .delete()
            .eq('user_id', user.id)
            .eq('ingredient_key', ingredientKey)
        } else {
          await supabase.from('brand_preferences').upsert({
  user_id: user.id,
  ingredient_key: ingredientKey,
  product_data: product,
}, { onConflict: 'user_id,ingredient_key' })
        }
      } catch (error) {
        console.error('Error saving brand preference:', error)
      }
    }
  }

  const getBrandPreference = (ingredientKey) => {
    return brandPreferences[ingredientKey] || null
  }

  const markMealEaten = async (meal) => {
    const today = getTodayDate()
    const isEaten = eatenMeals.some(e => e.meal_name === meal.name && e.eaten_date === today)

    if (isEaten) {
      setEatenMeals(prev => prev.filter(e => !(e.meal_name === meal.name && e.eaten_date === today)))
      if (user) {
        await supabase.from('eaten_meals')
          .delete()
          .eq('user_id', user.id)
          .eq('meal_name', meal.name)
          .eq('eaten_date', today)
      }
    } else {
      const newEntry = {
  meal_name: meal.name,
  meal_type: meal.type,
  calories: meal.cal,
  protein: meal.p || 0,
  carbs: meal.c || 0,
  fat: meal.f || 0,
  eaten_date: today,
}
      setEatenMeals(prev => [...prev, newEntry])
      if (user) {
        await supabase.from('eaten_meals').insert({
          user_id: user.id,
          ...newEntry,
        })
      }
    }
  }
  
  const toggleFavoriteRecipe = async (recipeId) => {
  const isFav = favoriteRecipes.includes(recipeId)

  if (isFav) {
    setFavoriteRecipes(prev => prev.filter(id => id !== recipeId))
    if (user) {
      await supabase.from('favorite_recipes')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
    }
  } else {
    setFavoriteRecipes(prev => [...prev, recipeId])
    if (user) {
      await supabase.from('favorite_recipes').insert({
        user_id: user.id,
        recipe_id: recipeId,
      })
    }
  }
}

const isFavoriteRecipe = (recipeId) => favoriteRecipes.includes(recipeId)

const replaceMeal = async (dayIndex, mealIndex) => {
  if (!mealPlan || !profile) return { success: false }
  const day = mealPlan.weekPlan[dayIndex]
  if (!day) return { success: false }
  const oldMeal = day.meals[mealIndex]
  if (!oldMeal) return { success: false }

  const pool = filterRecipes(getRecipesByType(oldMeal.type), profile)
    .filter(r => r.id !== oldMeal.recipeId)

  const tolerance = 0.15
  const candidates = pool.map(r => {
    const scaled = scaleRecipe(r, oldMeal.cal, profile.goal)
    const pDev = oldMeal.p > 0 ? Math.abs(scaled.p - oldMeal.p) / oldMeal.p : 0
    const fDev = oldMeal.f > 0 ? Math.abs(scaled.f - oldMeal.f) / oldMeal.f : 0
    return { recipe: r, scaled, pDev, fDev }
  }).filter(c => c.pDev <= tolerance && c.fDev <= tolerance)

  if (candidates.length === 0) return { success: false }

  const picked = candidates[Math.floor(Math.random() * candidates.length)]
  const newMeal = {
    id: oldMeal.id,
    recipeId: picked.recipe.id,
    name: picked.scaled.name,
    type: oldMeal.type,
    cal: picked.scaled.cal,
    p: picked.scaled.p,
    c: picked.scaled.c,
    f: picked.scaled.f,
    cost: picked.scaled.cost,
    ingredients: picked.scaled.ingredients.map(ing => ({
      food: ing.key, amount: ing.amount, unit: ing.unit, key: ing.key, displayName: ing.name,
    })),
    steps: picked.scaled.steps,
  }

  const updatedWeekPlan = mealPlan.weekPlan.map((d, di) => {
    if (di !== dayIndex) return d
    const updatedMeals = d.meals.map((m, mi) => mi === mealIndex ? newMeal : m)
    return {
      ...d,
      meals: updatedMeals,
      cal: updatedMeals.reduce((s, m) => s + m.cal, 0),
      p: Math.round(updatedMeals.reduce((s, m) => s + m.p, 0) * 10) / 10,
      c: Math.round(updatedMeals.reduce((s, m) => s + m.c, 0) * 10) / 10,
      f: Math.round(updatedMeals.reduce((s, m) => s + m.f, 0) * 10) / 10,
      cost: Math.round(updatedMeals.reduce((s, m) => s + m.cost, 0) * 100) / 100,
    }
  })

  const oldShoppingList = mealPlan.shoppingList || []
  const oldStateByKey = {}
  oldShoppingList.forEach(item => {
    oldStateByKey[item.ingredientKey] = {
      bought: item.bought,
      atHome: item.atHome,
      atHomeAmount: item.atHomeAmount,
    }
  })

  const freshShoppingList = generateShoppingList(updatedWeekPlan)
  const newIngredients = []
  const newShoppingList = freshShoppingList.map(item => {
    const oldState = oldStateByKey[item.ingredientKey]
    if (oldState) {
      return { ...item, bought: oldState.bought || false, atHome: oldState.atHome || false, atHomeAmount: oldState.atHomeAmount }
    }
    newIngredients.push(item.name)
    return item
  })

  const updatedPlan = { ...mealPlan, weekPlan: updatedWeekPlan, shoppingList: newShoppingList }
  setMealPlan(updatedPlan)

  if (user) {
    try {
      await supabase.from('meal_plans').upsert({ user_id: user.id, plan_data: updatedPlan })
    } catch (error) {
      console.error('Error saving replaced meal:', error)
    }
  }

  return { success: true, meal: newMeal, newIngredients }
}

  const markBatchCooked = async (ingredientKey, dayIndex, totalAmount) => {
    const updated = {
      ...mealPlan,
      batchCooked: {
        ...(mealPlan.batchCooked || {}),
        [ingredientKey]: { dayIndex, totalAmount },
      },
    }
    setMealPlan(updated)
    if (user) {
      try {
        await supabase.from('meal_plans').upsert({ user_id: user.id, plan_data: updated })
      } catch (error) {
        console.error('Error saving batch cooked:', error)
      }
    }
  }

  const unmarkBatchCooked = async (ingredientKey) => {
    const prev = { ...(mealPlan.batchCooked || {}) }
    delete prev[ingredientKey]
    const updated = { ...mealPlan, batchCooked: prev }
    setMealPlan(updated)
    if (user) {
      try {
        await supabase.from('meal_plans').upsert({ user_id: user.id, plan_data: updated })
      } catch (error) {
        console.error('Error removing batch cooked:', error)
      }
    }
  }

  const isBatchCooked = (ingredientKey, dayIndex) => {
    const entry = mealPlan?.batchCooked?.[ingredientKey]
    if (!entry) return false
    return entry.dayIndex === dayIndex
  }

  const isMealEaten = (mealName) => {
    return eatenMeals.some(e => e.meal_name === mealName && e.eaten_date === getTodayDate())
  }

  const todayEatenCalories = eatenMeals
    .filter(e => e.eaten_date === getTodayDate())
    .reduce((sum, e) => sum + (e.calories || 0), 0)

  const todayDayIndex = getDayIndex()

  return (
    <AppContext.Provider value={{
      user, profile, mealPlan, loading, generating,
      brandPreferences, eatenMeals, todayEatenCalories,
      todayDayIndex, showNewWeekPrompt, setShowNewWeekPrompt,
      login, signup, logout,
      saveProfile, regeneratePlan,
      toggleShoppingItem, resetShoppingList, markAtHome, splitShoppingItem,
      saveBrandPreference, getBrandPreference,
      markMealEaten, isMealEaten, replaceMeal,
      favoriteRecipes, toggleFavoriteRecipe, isFavoriteRecipe,
      markBatchCooked, unmarkBatchCooked, isBatchCooked,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}