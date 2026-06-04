import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Auth from './pages/Auth'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'
import WeeklyPlan from './pages/WeeklyPlan'
import ShoppingList from './pages/ShoppingList'
import Preferences from './pages/Preferences'
import MealDetail from './pages/MealDetail'
import BottomNav from './components/BottomNav'
import { AppProvider, useApp } from './context/AppContext'

function AppRoutes() {
  const { user, mealPlan, loading, generating } = useApp()

  if (loading) return (
  <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center gap-4">
    <div className="w-14 h-14 rounded-2xl bg-[#2D5A27] flex items-center justify-center text-2xl">
      🥗
    </div>
    <p style={{ fontFamily: "'Playfair Display', serif" }}
      className="text-[#2D5A27] text-[22px] font-bold">Moldova Meal Planner</p>
    <p className="text-[#888780] text-[13px]">Loading your plan...</p>
  </div>
)

if (generating) return (
  <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center gap-6 px-8">
    <div className="w-20 h-20 rounded-3xl bg-[#2D5A27] flex items-center justify-center text-4xl animate-bounce">
      🥗
    </div>
    <div className="flex flex-col items-center gap-2 text-center">
      <p style={{ fontFamily: "'Playfair Display', serif" }}
        className="text-[#2D5A27] text-[26px] font-bold">Building your plan...</p>
      <p className="text-[#888780] text-[14px] leading-relaxed">
        Our AI is creating a personalized meal plan using real Moldovan foods and your budget.
      </p>
    </div>
    <div className="flex gap-2 mt-2">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-2 h-2 rounded-full bg-[#2D5A27] animate-bounce"
          style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  </div>
)

  if (!user) return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )

  if (!mealPlan) return (
    <Routes>
      <Route path="/setup" element={<Setup />} />
      <Route path="*" element={<Navigate to="/setup" />} />
    </Routes>
  )

  return (
    <div className="pb-24">
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/plan" element={<WeeklyPlan />} />
        <Route path="/shopping" element={<ShoppingList />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/meal" element={<MealDetail />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="min-h-screen bg-gray-950 text-white">
          <AppRoutes />
        </div>
      </AppProvider>
    </BrowserRouter>
  )
}