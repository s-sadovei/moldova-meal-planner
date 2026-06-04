import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const mealEmojis = { breakfast: '🌅', lunch: '🍗', dinner: '🐟', snack: '🥛' }
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function WeeklyPlan() {
  const { mealPlan } = useApp() 
  const navigate = useNavigate()
  const location = useLocation()
const [selectedDay, setSelectedDay] = useState(() => location.state?.restoreDay ?? 0)
  const [expandedMeal, setExpandedMeal] = useState(null)

  if (!mealPlan) return null

  const day = mealPlan.weekPlan[selectedDay]

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">

      {/* Header */}
      <div className="bg-[#2D5A27] px-6 pt-12 pb-6 flex flex-col gap-5">
        <h1 style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-white text-[30px] font-extrabold leading-tight">
          Weekly<br />Plan.
        </h1>

        {/* Day selector */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {mealPlan.weekPlan.map((d, i) => (
            <button key={i} onClick={() => { setSelectedDay(i); setExpandedMeal(null) }}
              className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-[14px] transition"
              style={{ background: selectedDay === i ? '#C0DD97' : 'rgba(255,255,255,0.1)' }}>
              <span className="text-[11px] font-semibold"
                style={{ color: selectedDay === i ? '#2D5A27' : 'rgba(255,255,255,0.7)' }}>
                {days[i]}
              </span>
              <span className="text-[15px] font-bold"
                style={{ color: selectedDay === i ? '#2D5A27' : '#ffffff' }}>
                {i + 1}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Wave */}
      <div className="bg-[#2D5A27] h-7" style={{ clipPath: 'ellipse(110% 100% at 50% 0%)' }} />

      {/* Body */}
      <div className="flex-1 px-5 pb-28 flex flex-col gap-3 overflow-y-auto">

        {/* Day macros */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: '🔥', val: `${day.cal}`, label: 'kcal' },
            { icon: '💪', val: `${day.p}g`, label: 'protein' },
            { icon: '🌾', val: `${day.c}g`, label: 'carbs' },
            { icon: '🥑', val: `${day.f}g`, label: 'fat' },
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
                <p className="text-[11px] font-semibold text-[#639922] uppercase tracking-wide capitalize">{meal.type}</p>
                <p className="text-[15px] font-semibold text-[#2C2C2A] mt-0.5">{meal.name}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[14px] font-bold text-[#2D5A27]">{meal.cal} kcal</span>
                <span className="text-[11px] text-[#B4B2A9] font-medium">{meal.p}g protein</span>
              </div>
              <span className="text-[#B4B2A9] text-[18px] ml-1">{expandedMeal === i ? '↑' : '↓'}</span>
            </div>

            {/* Expanded content */}
            {expandedMeal === i && (
              <div className="border-t border-[#F0EEE8] px-4 py-4 flex flex-col gap-4">

                {/* Macros */}
                <div className="grid grid-cols-3 gap-2">
                  {[['Protein', `${meal.p}g`], ['Carbs', `${meal.c}g`], ['Fat', `${meal.f}g`]].map(([label, val]) => (
                    <div key={label} className="bg-[#F7F5F0] rounded-[10px] p-2 flex flex-col items-center gap-1">
                      <span className="text-[14px] font-bold text-[#2C2C2A]">{val}</span>
                      <span className="text-[10px] text-[#888780]">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Ingredients */}
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Ingredients</p>
                  {meal.ingredients.map(({ food, amount }, j) => (
                    <div key={j} className="flex justify-between items-center">
                      <span className="text-[13px] font-medium text-[#2C2C2A] capitalize">{food}</span>
                      <span className="text-[12px] text-[#B4B2A9]">{amount}g</span>
                    </div>
                  ))}
                </div>

                {/* Preparation */}
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Preparation</p>
                  <p className="text-[13px] text-[#5F5E5A] leading-relaxed">
                    Prepare all ingredients. Cook using your preferred method. Season to taste. Serve fresh.
                  </p>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center">
                  <span className="text-[#639922] text-[13px] font-semibold">~{meal.cost} MDL</span>
                  <button className="bg-[#F7F5F0] border-[1.5px] border-[#E8E6E0] text-[#5F5E5A] text-[12px] font-semibold px-4 py-2 rounded-[10px]">
                    Replace meal
                  </button>
                </div>

              </div>
            )}
          </div>
        ))}

      </div>
    </div>
  )
}