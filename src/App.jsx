import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Auth from './pages/Auth'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'
import WeeklyPlan from './pages/WeeklyPlan'
import ShoppingList from './pages/ShoppingList'
import Preferences from './pages/Preferences'
import BottomNav from './components/BottomNav'
import { AppProvider, useApp } from './context/AppContext'
import MealDetail from './pages/MealDetail'

function AppRoutes() {
  const { user, mealPlan } = useApp()

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
    <div className="pb-16">
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/plan" element={<WeeklyPlan />} />
        <Route path="/shopping" element={<ShoppingList />} />
        <Route path="/meal" element={<MealDetail />} />
        <Route path="/preferences" element={<Preferences />} />
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
