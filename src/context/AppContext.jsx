import { createContext, useContext, useState } from 'react'
import { generateMealPlan } from '../utils/mealPlanGenerator'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [mealPlan, setMealPlan] = useState(null)
  const [brandPreferences, setBrandPreferences] = useState({})

  const login = (email) => {
    setUser({ email })
  }

  const logout = () => {
    setUser(null)
    setProfile(null)
    setMealPlan(null)
    setBrandPreferences({})
  }

  const saveProfile = (profileData) => {
    setProfile(profileData)
    const plan = generateMealPlan(profileData)
    setMealPlan(plan)
  }

  const regeneratePlan = () => {
    if (profile) {
      const plan = generateMealPlan(profile)
      setMealPlan(plan)
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

  const saveBrandPreference = (ingredientKey, product) => {
    setBrandPreferences(prev => ({
      ...prev,
      [ingredientKey]: product
    }))
  }

  const getBrandPreference = (ingredientKey) => {
    return brandPreferences[ingredientKey] || null
  }

  return (
    <AppContext.Provider value={{
      user, profile, mealPlan,
      brandPreferences,
      login, logout, saveProfile,
      regeneratePlan, toggleShoppingItem,
      saveBrandPreference, getBrandPreference,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}