import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { formatAmount } from '../utils/displayUnits'

const mealEmojis = { breakfast: '🌅', lunch: '🍗', dinner: '🐟', snack: '🥛' }
const dayLabels = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum']

export default function WeeklyPlan() {
  const { mealPlan, replaceMeal, todayDayIndex } = useApp()

  const weekDates = useMemo(() => {
    const now = new Date()
    const dow = now.getDay()
    const mondayOffset = dow === 0 ? -6 : 1 - dow
    const monday = new Date(now)
    monday.setDate(now.getDate() + mondayOffset)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d.getDate()
    })
  }, [])
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedDay, setSelectedDay] = useState(() => location.state?.restoreDay ?? todayDayIndex)
  const [expandedMeal, setExpandedMeal] = useState(null)
  const [replacingMeal, setReplacingMeal] = useState(null)
  const [showNoReplacement, setShowNoReplacement] = useState(false)
  const [newIngredientsMsg, setNewIngredientsMsg] = useState(null)

  if (!mealPlan) return null

  const day = mealPlan.weekPlan[selectedDay]

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">

      {/* Header */}
      <div className="bg-[#2D5A27] px-6 pt-12 pb-6 flex flex-col gap-5">
        <h1 style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-white text-[30px] font-extrabold leading-tight">
          Plan<br />Săptămânal.
        </h1>

        {/* Day selector */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {mealPlan.weekPlan.map((d, i) => (
            <button key={i} onClick={() => { setSelectedDay(i); setExpandedMeal(null) }}
              className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-[14px] transition"
              style={{ background: selectedDay === i ? '#C0DD97' : 'rgba(255,255,255,0.1)' }}>
              <span className="text-[11px] font-semibold"
                style={{ color: selectedDay === i ? '#2D5A27' : 'rgba(255,255,255,0.7)' }}>
                {dayLabels[i]}
              </span>
              <span className="text-[15px] font-bold"
                style={{ color: selectedDay === i ? '#2D5A27' : '#ffffff' }}>
                {weekDates[i]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Wave */}
      <div className="bg-[#2D5A27] h-7" style={{ clipPath: 'ellipse(110% 100% at 50% 0%)' }} />

      {/* Body */}
      <div className="flex-1 px-5 pb-28 flex flex-col gap-3 overflow-y-auto">

        {newIngredientsMsg && (
          <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-[16px] px-4 py-3 flex flex-col gap-1">
            <p className="text-[13px] font-semibold text-[#F57F17]">🛒 Ingrediente noi necesare</p>
            <p className="text-[12px] text-[#888780]">{newIngredientsMsg} — verifică lista de cumpărături.</p>
          </div>
        )}

        {/* Day macros */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: '🔥', val: `${day.cal}`, label: 'kcal' },
            { icon: '💪', val: `${day.p}g`, label: 'proteină' },
            { icon: '🌾', val: `${day.c}g`, label: 'carbohidrați' },
            { icon: '🥑', val: `${day.f}g`, label: 'grăsimi' },
          ].map(({ icon, val, label }) => (
            <div key={label} className="bg-white rounded-[12px] border border-[#E8E6E0] p-2 flex flex-col items-center gap-1">
              <span className="text-[16px]">{icon}</span>
              <span className="text-[13px] font-bold text-[#2C2C2A]">{val}</span>
              <span className="text-[10px] text-[#B4B2A9] font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Meal cards */}
        {day.meals.map((meal, i) => (
          <div key={i} className="bg-white rounded-[20px] border border-[#E8E6E0] overflow-hidden">

            {/* Card header */}
            <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
              onClick={() => navigate('/meal', { state: { meal, fromDay: selectedDay } })}>
              <span className="text-[26px] w-9 text-center">{mealEmojis[meal.type] || '🍽️'}</span>
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-[#639922] uppercase tracking-wide">
  {meal.type === 'breakfast' ? 'Mic dejun' : meal.type === 'lunch' ? 'Prânz' : meal.type === 'dinner' ? 'Cină' : 'Gustare'}
</p>
                <p className="text-[15px] font-semibold text-[#2C2C2A] mt-0.5">{meal.name}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[14px] font-bold text-[#2D5A27]">{meal.cal} kcal</span>
                <span className="text-[11px] text-[#B4B2A9] font-medium">{meal.p}g proteină</span>
              </div>
              <span className="text-[#B4B2A9] text-[18px] ml-1">{expandedMeal === i ? '↑' : '↓'}</span>
            </div>

            {/* Expanded content */}
            {expandedMeal === i && (
              <div className="border-t border-[#F0EEE8] px-4 py-4 flex flex-col gap-4">

                {/* Macros */}
                <div className="grid grid-cols-3 gap-2">
                  {[['Proteină', `${meal.p}g`], ['Carbohidrați', `${meal.c}g`], ['Grăsimi', `${meal.f}g`]].map(([label, val]) => (
                    <div key={label} className="bg-[#F7F5F0] rounded-[10px] p-2 flex flex-col items-center gap-1">
                      <span className="text-[14px] font-bold text-[#2C2C2A]">{val}</span>
                      <span className="text-[10px] text-[#888780]">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Ingredients */}
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Ingrediente</p>
                  {meal.ingredients.map(({ food, amount, displayName }, j) => (
                    <div key={j} className="flex justify-between items-center">
                      <span className="text-[13px] font-medium text-[#2C2C2A] capitalize">{displayName || food}</span>
                      <span className="text-[12px] text-[#B4B2A9]">{formatAmount(food, amount)}</span>
                    </div>
                  ))}
                </div>

                {/* Preparation */}
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Preparare</p>
                  <p className="text-[13px] text-[#5F5E5A] leading-relaxed">
                    Apasă pe masă pentru a vedea instrucțiunile complete de preparare.
                  </p>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center">
                  <span className="text-[#639922] text-[13px] font-semibold">~{meal.cost} MDL</span>
                  <button
                    disabled={replacingMeal === i}
                    onClick={async (e) => {
                      e.stopPropagation()
                      setReplacingMeal(i)
                      const result = await replaceMeal(selectedDay, i)
                      setReplacingMeal(null)
                      if (!result.success) {
                        setShowNoReplacement(true)
                      } else if (result.newIngredients?.length > 0) {
                        setNewIngredientsMsg(result.newIngredients.join(', '))
                        setTimeout(() => setNewIngredientsMsg(null), 5000)
                      }
                    }}
                    className="bg-[#F7F5F0] border-[1.5px] border-[#E8E6E0] text-[#5F5E5A] text-[12px] font-semibold px-4 py-2 rounded-[10px] disabled:opacity-50">
                    {replacingMeal === i ? '⏳ Se caută...' : '🔄 Înlocuiește'}
                  </button>
                </div>

              </div>
            )}
          </div>
        ))}

      </div>

      {showNoReplacement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-[24px] p-6 flex flex-col gap-4 w-full max-w-sm">
            <div className="text-center">
              <p className="text-[32px]">😕</p>
              <p style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-[#2C2C2A] text-[20px] font-extrabold mt-2">Nu am găsit o înlocuire</p>
              <p className="text-[#888780] text-[13px] mt-1 leading-relaxed">
                Nu există o altă rețetă cu macronutrienți similari (±15% proteină și grăsimi). Poți regenera planul complet din pagina principală.
              </p>
            </div>
            <button onClick={() => { setShowNoReplacement(false); navigate('/dashboard') }}
              className="w-full bg-[#2D5A27] text-white font-semibold text-[15px] py-4 rounded-2xl">
              Mergi la pagina principală
            </button>
            <button onClick={() => setShowNoReplacement(false)}
              className="w-full bg-[#F7F5F0] text-[#5F5E5A] font-semibold text-[15px] py-4 rounded-2xl">
              Închide
            </button>
          </div>
        </div>
      )}
    </div>
  )
}