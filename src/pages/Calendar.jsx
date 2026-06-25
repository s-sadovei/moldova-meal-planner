import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase } from '../supabase'

const monthNames = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
]
const dayLabels = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum']
const mealTypeRo = { breakfast: 'Mic dejun', lunch: 'Prânz', dinner: 'Cină', snack: 'Gustare' }
const mealEmojis = { breakfast: '🌅', lunch: '🍗', dinner: '🐟', snack: '🥛' }

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1)
  let startDow = firstDay.getDay()
  startDow = startDow === 0 ? 6 : startDow - 1

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()

  const cells = []

  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, currentMonth: false, date: null })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, currentMonth: true, date: dateStr })
  }

  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, currentMonth: false, date: null })
    }
  }

  return cells
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getDate()} ${monthNames[d.getMonth()]}`
}

export default function Calendar() {
  const navigate = useNavigate()
  const { user, mealPlan, eatenMeals, todayDayIndex } = useApp()

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)
  const [historyMeals, setHistoryMeals] = useState({})
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (!user) return
    loadMonthHistory(viewYear, viewMonth)
  }, [user, viewYear, viewMonth])

  const loadMonthHistory = async (year, month) => {
    setLoadingHistory(true)
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const endDay = new Date(year, month + 1, 0).getDate()
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`

    const { data } = await supabase
      .from('eaten_meals')
      .select('*')
      .eq('user_id', user.id)
      .gte('eaten_date', startDate)
      .lte('eaten_date', endDate)
      .order('eaten_date')

    if (data) {
      const grouped = {}
      data.forEach(meal => {
        if (!grouped[meal.eaten_date]) grouped[meal.eaten_date] = []
        grouped[meal.eaten_date].push(meal)
      })
      setHistoryMeals(prev => ({ ...prev, ...grouped }))
    }
    setLoadingHistory(false)
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }

  const nextMonth = () => {
    const maxDate = new Date(today.getFullYear(), today.getMonth())
    const nextDate = new Date(viewYear, viewMonth + 1)
    if (nextDate > maxDate) return
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth()
  const canGoNext = !isCurrentMonth

  const planWeekDates = useMemo(() => {
    if (!mealPlan) return {}
    const now = new Date()
    const currentDow = now.getDay()
    const mondayOffset = currentDow === 0 ? -6 : 1 - currentDow
    const monday = new Date(now)
    monday.setDate(now.getDate() + mondayOffset)

    const dates = {}
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      dates[dateStr] = i
    }
    return dates
  }, [mealPlan])

  const getMealsForDate = (dateStr) => {
    if (dateStr === todayStr && eatenMeals.length > 0) {
      return eatenMeals.filter(e => e.eaten_date === todayStr)
    }
    return historyMeals[dateStr] || []
  }

  const getDayStatus = (dateStr) => {
    if (!dateStr) return 'none'
    if (dateStr > todayStr && !(dateStr in planWeekDates)) return 'future'
    if (dateStr > todayStr && dateStr in planWeekDates) return 'planned'

    const meals = getMealsForDate(dateStr)
    if (meals.length === 0) {
      if (dateStr in planWeekDates) return 'planned'
      return 'none'
    }

    const totalCal = meals.reduce((s, m) => s + (Number(m.calories) || 0), 0)
    const target = mealPlan?.calorieTarget || 2000
    const ratio = totalCal / target

    if (ratio >= 0.85 && ratio <= 1.15) return 'perfect'
    if (ratio >= 0.5) return 'partial'
    return 'minimal'
  }

  const statusColors = {
    perfect: 'bg-[#2D5A27]',
    partial: 'bg-[#C0DD97]',
    minimal: 'bg-[#E8C85A]',
    planned: 'bg-[#E8E6E0]',
    none: '',
    future: '',
  }

  const cells = getMonthDays(viewYear, viewMonth)

  const selectedMeals = selectedDate ? getMealsForDate(selectedDate) : []
  const selectedTotalCal = selectedMeals.reduce((s, m) => s + (Number(m.calories) || 0), 0)
  const selectedTotalP = Math.round(selectedMeals.reduce((s, m) => s + (Number(m.protein) || 0), 0) * 10) / 10
  const selectedTotalC = Math.round(selectedMeals.reduce((s, m) => s + (Number(m.carbs) || 0), 0) * 10) / 10
  const selectedTotalF = Math.round(selectedMeals.reduce((s, m) => s + (Number(m.fat) || 0), 0) * 10) / 10
  const isPlanDay = selectedDate && selectedDate in planWeekDates
  const planDayIndex = isPlanDay ? planWeekDates[selectedDate] : null
  const planDayData = isPlanDay && mealPlan ? mealPlan.weekPlan[planDayIndex] : null

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">

      {/* Header */}
      <div className="bg-[#2D5A27] px-6 pt-12 pb-6 flex flex-col gap-4">
        <h1 style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-white text-[28px] font-extrabold leading-tight">
          Calendar
        </h1>
        <p className="text-[#9FE1CB] text-[13px] font-medium -mt-2">Istoricul tău nutrițional</p>

        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-[18px]">
            ‹
          </button>
          <p className="text-white text-[18px] font-bold">
            {monthNames[viewMonth]} {viewYear}
          </p>
          <button onClick={nextMonth} disabled={!canGoNext}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-[18px] disabled:opacity-30">
            ›
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1">
          {dayLabels.map(d => (
            <div key={d} className="text-center text-[11px] font-semibold text-[#9FE1CB]">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 -mt-1">
          {cells.map((cell, i) => {
            const status = getDayStatus(cell.date)
            const isToday = cell.date === todayStr
            const isSelected = cell.date === selectedDate
            const isFuture = cell.date > todayStr
            const isFuturePlanDay = isFuture && cell.date in planWeekDates
            const isDisabled = !cell.currentMonth || (isFuture && !isFuturePlanDay)

            return (
              <button key={i}
                disabled={isDisabled}
                onClick={() => cell.currentMonth && !isDisabled && setSelectedDate(cell.date === selectedDate ? null : cell.date)}
                className={`relative flex flex-col items-center justify-center py-2 rounded-[10px] transition
                  ${!cell.currentMonth ? 'opacity-20' : ''}
                  ${isFuture && !isFuturePlanDay && cell.currentMonth ? 'opacity-30' : ''}
                  ${isSelected ? 'bg-white/20 ring-2 ring-[#C0DD97]' : ''}
                  ${isToday && !isSelected ? 'bg-white/10' : ''}`}>
                <span className={`text-[14px] font-semibold ${isToday ? 'text-[#C0DD97]' : 'text-white'}`}>
                  {cell.day}
                </span>
                {cell.currentMonth && !isDisabled && (
                  <div className={`w-[6px] h-[6px] rounded-full mt-1 ${statusColors[status]}`} />
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-1">
          {[
            { color: 'bg-[#2D5A27]', label: 'Țintă atinsă', border: 'border border-white/30' },
            { color: 'bg-[#C0DD97]', label: 'Parțial' },
            { color: 'bg-[#E8C85A]', label: 'Minim' },
            { color: 'bg-[#E8E6E0]', label: 'Planificat' },
          ].map(({ color, label, border }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-[6px] h-[6px] rounded-full ${color} ${border || ''}`} />
              <span className="text-[10px] text-[#9FE1CB]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wave */}
      <div className="bg-[#2D5A27] h-7" style={{ clipPath: 'ellipse(110% 100% at 50% 0%)' }} />

      {/* Body */}
      <div className="flex-1 px-5 pb-28 flex flex-col gap-4 overflow-y-auto">

        {!selectedDate && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <span className="text-[40px]">📅</span>
            <p className="text-[#888780] text-[14px] text-center font-medium">
              Apasă pe o zi pentru a vedea detaliile nutriționale
            </p>
          </div>
        )}

        {selectedDate && (
          <>
            {/* Date header */}
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontFamily: "'Playfair Display', serif" }}
                  className="text-[#2D5A27] text-[22px] font-extrabold">
                  {formatDate(selectedDate)}
                </p>
                <p className="text-[#888780] text-[12px] font-medium">
                  {selectedDate === todayStr ? 'Astăzi' : isPlanDay ? 'Săptămâna curentă' : 'Istoric'}
                </p>
              </div>
              {selectedMeals.length > 0 && (
                <div className="bg-[#EAF3DE] px-3 py-1.5 rounded-full">
                  <span className="text-[#2D5A27] text-[13px] font-bold">{selectedTotalCal} kcal</span>
                </div>
              )}
            </div>

            {/* Macros summary */}
            {selectedMeals.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: '🔥', val: `${selectedTotalCal}`, label: 'kcal', target: mealPlan?.calorieTarget },
                  { icon: '💪', val: `${selectedTotalP}g`, label: 'proteină', target: mealPlan?.proteinTarget },
                  { icon: '🌾', val: `${selectedTotalC}g`, label: 'carbohidrați' },
                  { icon: '🥑', val: `${selectedTotalF}g`, label: 'grăsimi' },
                ].map(({ icon, val, label, target }) => (
                  <div key={label} className="bg-white rounded-[12px] border border-[#E8E6E0] p-2 flex flex-col items-center gap-1">
                    <span className="text-[16px]">{icon}</span>
                    <span className="text-[13px] font-bold text-[#2C2C2A]">{val}</span>
                    <span className="text-[10px] text-[#B4B2A9] font-medium">{label}</span>
                    {target && (
                      <span className="text-[9px] text-[#B4B2A9]">/ {target}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Calorie progress bar for the day */}
            {selectedMeals.length > 0 && mealPlan && (
              <div className="bg-white rounded-[16px] border border-[#E8E6E0] p-4">
                <div className="flex justify-between text-[12px] mb-2">
                  <span className="text-[#888780]">Progres caloric</span>
                  <span className="text-[#888780]">{Math.round((selectedTotalCal / mealPlan.calorieTarget) * 100)}%</span>
                </div>
                <div className="w-full h-[6px] bg-[#F0EEE8] rounded-full overflow-hidden flex">
                  {(() => {
                    const ratio = selectedTotalCal / mealPlan.calorieTarget
                    const greenPct = Math.min(ratio, 1) * 100
                    const isOver = ratio > 1
                    const overPct = isOver ? Math.min((ratio - 1) * 100, 100 - greenPct) : 0
                    return (
                      <>
                        <div className="h-full transition-all duration-500"
                          style={{ width: `${greenPct}%`, backgroundColor: '#2D5A27', borderRadius: isOver ? '9999px 0 0 9999px' : '9999px' }} />
                        {isOver && (
                          <div className="h-full transition-all duration-500"
                            style={{ width: `${overPct}%`, backgroundColor: '#D97706', borderRadius: '0 9999px 9999px 0' }} />
                        )}
                      </>
                    )
                  })()}
                </div>
                <p className="text-[11px] mt-1.5" style={{ color: selectedTotalCal > mealPlan.calorieTarget ? '#D97706' : '#B4B2A9' }}>
                  {selectedTotalCal > mealPlan.calorieTarget
                    ? `+${selectedTotalCal - mealPlan.calorieTarget} kcal peste țintă`
                    : `${mealPlan.calorieTarget - selectedTotalCal} kcal rămase`}
                </p>
              </div>
            )}

            {/* Eaten meals list */}
            {selectedMeals.length > 0 && (
              <>
                <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Mese consumate</p>
                <div className="bg-white rounded-[20px] border border-[#E8E6E0] px-4 py-2 -mt-2">
                  {selectedMeals.map((meal, i) => (
                    <div key={i}
                      className={`flex items-center gap-3 py-3 ${i < selectedMeals.length - 1 ? 'border-b border-[#F0EEE8]' : ''}`}>
                      <span className="text-[24px] w-9 text-center">{mealEmojis[meal.meal_type] || '🍽️'}</span>
                      <div className="flex-1">
                        <p className="text-[#2C2C2A] text-[14px] font-semibold">{meal.meal_name}</p>
                        <p className="text-[#B4B2A9] text-[12px] font-medium">{mealTypeRo[meal.meal_type] || meal.meal_type}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[#639922] text-[13px] font-semibold">{meal.calories} kcal</span>
                        <p className="text-[#B4B2A9] text-[10px]">{meal.protein || 0}p · {meal.carbs || 0}c · {meal.fat || 0}f</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* No meals eaten message */}
            {selectedMeals.length === 0 && !isPlanDay && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <span className="text-[36px]">🍽️</span>
                <p className="text-[#888780] text-[14px] text-center font-medium">
                  Nu sunt mese înregistrate în această zi
                </p>
              </div>
            )}

            {/* Planned meals for current week */}
            {isPlanDay && planDayData && (
              <>
                <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">
                  {selectedMeals.length > 0 ? 'Mese planificate' : 'Mese planificate pentru această zi'}
                </p>
                <div className="bg-white rounded-[20px] border border-[#E8E6E0] px-4 py-2 -mt-2">
                  {planDayData.meals.map((meal, i) => {
                    const wasEaten = selectedMeals.some(e => e.meal_name === meal.name)
                    return (
                      <div key={i}
                        onClick={() => navigate('/meal', { state: { meal, fromDay: planDayIndex } })}
                        className={`flex items-center gap-3 py-3 cursor-pointer ${i < planDayData.meals.length - 1 ? 'border-b border-[#F0EEE8]' : ''} ${wasEaten ? 'opacity-50' : ''}`}>
                        <span className="text-[24px] w-9 text-center">{mealEmojis[meal.type] || '🍽️'}</span>
                        <div className="flex-1">
                          <p className={`text-[#2C2C2A] text-[14px] font-semibold ${wasEaten ? 'line-through' : ''}`}>{meal.name}</p>
                          <p className="text-[#B4B2A9] text-[12px] font-medium">{mealTypeRo[meal.type] || meal.type}</p>
                        </div>
                        <span className="text-[#639922] text-[13px] font-semibold">{meal.cal} kcal</span>
                        {wasEaten && <span className="text-[#2D5A27] text-[16px]">✓</span>}
                        <span className="text-[#D3D1C7] text-[16px]">›</span>
                      </div>
                    )
                  })}
                </div>

                {/* Plan day macros */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: '🔥', val: `${planDayData.cal}`, label: 'kcal planif.' },
                    { icon: '💪', val: `${planDayData.p}g`, label: 'proteină' },
                    { icon: '🌾', val: `${planDayData.c}g`, label: 'carbohidrați' },
                    { icon: '🥑', val: `${planDayData.f}g`, label: 'grăsimi' },
                  ].map(({ icon, val, label }) => (
                    <div key={label} className="bg-[#EAF3DE] rounded-[12px] p-2 flex flex-col items-center gap-1">
                      <span className="text-[16px]">{icon}</span>
                      <span className="text-[13px] font-bold text-[#2D5A27]">{val}</span>
                      <span className="text-[10px] text-[#5F8A3A] font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Streak / stats for current month */}
            {selectedDate === todayStr && (() => {
              const monthDates = cells.filter(c => c.currentMonth && c.date && c.date <= todayStr)
              const daysWithMeals = monthDates.filter(c => getMealsForDate(c.date).length > 0).length
              const perfectDays = monthDates.filter(c => {
                const meals = getMealsForDate(c.date)
                if (meals.length === 0) return false
                const cal = meals.reduce((s, m) => s + (Number(m.calories) || 0), 0)
                const ratio = cal / (mealPlan?.calorieTarget || 2000)
                return ratio >= 0.85 && ratio <= 1.15
              }).length

              let streak = 0
              for (let i = monthDates.length - 1; i >= 0; i--) {
                if (getMealsForDate(monthDates[i].date).length > 0) streak++
                else break
              }

              return (
                <>
                  <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Statistici luna aceasta</p>
                  <div className="grid grid-cols-3 gap-2 -mt-2">
                    {[
                      { val: daysWithMeals, label: 'Zile urmărite', icon: '📊' },
                      { val: perfectDays, label: 'Zile perfecte', icon: '⭐' },
                      { val: streak, label: 'Serie curentă', icon: '🔥' },
                    ].map(({ val, label, icon }) => (
                      <div key={label} className="bg-white rounded-[14px] border border-[#E8E6E0] p-3 flex flex-col items-center gap-1">
                        <span className="text-[20px]">{icon}</span>
                        <span style={{ fontFamily: "'Playfair Display', serif" }}
                          className="text-[22px] font-bold text-[#2D5A27]">{val}</span>
                        <span className="text-[10px] text-[#888780] font-medium text-center">{label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )
            })()}
          </>
        )}
      </div>
    </div>
  )
}
