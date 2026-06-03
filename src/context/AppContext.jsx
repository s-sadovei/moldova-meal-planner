import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { generateMealPlan } from '../utils/mealPlanGenerator'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [mealPlan, setMealPlan] = useState(null)
  const [brandPreferences, setBrandPreferences] = useState({})
  const [loading, setLoading] = useState(true)
const [generating, setGenerating] = useState(false)

  // Listen for auth changes
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
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserData = async (userId) => {
    try {
      // Load profile
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

        // Load meal plan
        const { data: planData } = await supabase
          .from('meal_plans')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (planData) {
          setMealPlan(planData.plan_data)
        }

        // Load brand preferences
        const { data: prefsData } = await supabase
          .from('brand_preferences')
          .select('*')
          .eq('user_id', userId)

        if (prefsData) {
          const prefs = {}
          prefsData.forEach(p => { prefs[p.ingredient_key] = p.product_data })
          setBrandPreferences(prefs)
        }
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
      body: JSON.stringify({ profile: profileData }),
    })
    if (!response.ok) throw new Error('AI generation failed')
    plan = await response.json()
  } catch (error) {
    console.error('AI failed, using local generator:', error)
    plan = generateMealPlan(profileData)
  } finally {
    setGenerating(false)
  }

  setMealPlan(plan)

    if (user) {
      try {
        // Save profile
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

        // Save meal plan
        await supabase.from('meal_plans').upsert({
          user_id: user.id,
          plan_data: plan,
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
        body: JSON.stringify({ profile }),
      })
      if (!response.ok) throw new Error('AI generation failed')
      plan = await response.json()
    } catch (error) {
      console.error('AI failed, using local generator:', error)
      plan = generateMealPlan(profile)
    } finally {
      setGenerating(false)
    }
    setMealPlan(plan)

      if (user) {
        try {
          await supabase.from('meal_plans').upsert({
            user_id: user.id,
            plan_data: plan,
          })
        } catch (error) {
          console.error('Error saving regenerated plan:', error)
        }
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
    setBrandPreferences(prev => ({
      ...prev,
      [ingredientKey]: product
    }))

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

  return (
    <AppContext.Provider value={{
      user, profile, mealPlan, loading, generating,
      brandPreferences,
      login, signup, logout,
      saveProfile, regeneratePlan,
      toggleShoppingItem,
      saveBrandPreference, getBrandPreference,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}