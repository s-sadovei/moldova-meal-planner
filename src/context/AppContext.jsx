import { generateShoppingList } from '../utils/shoppingListGenerator'
import { getAllIngredientMacros } from '../utils/moldovanProducts'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { generateMealPlan } from '../utils/mealPlanGenerator'

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
    setProfile(profileData)
    setGenerating(true)

    let plan
    try {
      const response = await fetch('https://moldova-meal-planner-production.up.railway.app/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: profileData, ingredientMacros: getAllIngredientMacros() }),
      })
      if (!response.ok) throw new Error('AI generation failed')
      plan = await response.json()
    } catch (error) {
      console.error('AI failed, using local generator:', error)
      plan = generateMealPlan(profileData)
    } finally {
      setGenerating(false)
    }

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
      let plan
      try {
        const response = await fetch('https://moldova-meal-planner-production.up.railway.app/generate-meal-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, ingredientMacros: getAllIngredientMacros() }),
        })
        if (!response.ok) throw new Error('AI generation failed')
        plan = await response.json()
      } catch (error) {
        console.error('AI failed, using local generator:', error)
        plan = generateMealPlan(profile)
      } finally {
        setGenerating(false)
      }
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

  const toggleShoppingItem = (itemId) => {
    setMealPlan(prev => ({
      ...prev,
      shoppingList: prev.shoppingList.map(item =>
        item.id === itemId ? { ...item, bought: !item.bought } : item
      )
    }))
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
          })
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
      toggleShoppingItem,
      saveBrandPreference, getBrandPreference,
      markMealEaten, isMealEaten,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}