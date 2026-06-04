import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const mealEmojis = { breakfast: '🌅', lunch: '🍗', dinner: '🐟', snack: '🥛' }

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile, mealPlan, regeneratePlan, todayEatenCalories, todayDayIndex, isMealEaten, eatenMeals, showNewWeekPrompt, setShowNewWeekPrompt } = useApp()

  if (!mealPlan) return null

  const today = mealPlan.weekPlan[todayDayIndex] || mealPlan.weekPlan[0]
  const budgetPct = profile?.budget ? Math.min(100, (mealPlan.weekCost / profile.budget) * 100) : 80
  const progressPct = Math.min(100, (todayEatenCalories / mealPlan.calorieTarget) * 100)
  const todayDate = new Date().toISOString().split('T')[0]
const todayEaten = eatenMeals.filter(e => e.eaten_date === todayDate)
const todayEatenProtein = todayEaten.reduce((sum, e) => sum + (Number(e.protein) || 0), 0)
const todayEatenCarbs = todayEaten.reduce((sum, e) => sum + (Number(e.carbs) || 0), 0)
const todayEatenFat = todayEaten.reduce((sum, e) => sum + (Number(e.fat) || 0), 0)

const todayDate = new Date().toISOString().split('T')[0]
const todayEaten = eatenMeals.filter(e => e.eaten_date === todayDate)
console.log('eatenMeals:', eatenMeals)
console.log('todayEaten:', todayEaten)
console.log('protein values:', todayEaten.map(e => e.protein))

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">

      {/* New week prompt */}
      {showNewWeekPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-[24px] p-6 flex flex-col gap-4 w-full max-w-sm">
            <div className="text-center">
              <p className="text-[32px]">🎉</p>
              <p style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-[#2D5A27] text-[22px] font-extrabold mt-2">New week!</p>
              <p className="text-[#888780] text-[14px] mt-1">Would you like to generate a fresh meal plan for this week?</p>
            </div>
            <button onClick={() => { regeneratePlan(); setShowNewWeekPrompt(false) }}
              className="w-full bg-[#2D5A27] text-white font-semibold text-[15px] py-4 rounded-2xl">
              Yes, generate new plan
            </button>
            <button onClick={() => setShowNewWeekPrompt(false)}
              className="w-full bg-[#F7F5F0] text-[#5F5E5A] font-semibold text-[15px] py-4 rounded-2xl">
              Keep current plan
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#2D5A27] px-6 pt-12 pb-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-white text-[28px] font-extrabold leading-tight">
              Hey, {profile?.name} 👋
            </h1>
            <p className="text-[#9FE1CB] text-[13px] font-medium mt-1">Here's your plan for today.</p>
          </div>
          <span className="bg-[#C0DD97] text-[#2D5A27] text-[11px] font-bold px-3 py-1.5 rounded-full">Active</span>
        </div>

        <div className="flex gap-2">
          <div className="bg-white/10 rounded-full px-4 py-2 flex items-center gap-2">
            <span className="text-[16px]">🔥</span>
            <span className="text-white text-[14px] font-semibold">{mealPlan.calorieTarget.toLocaleString()}</span>
            <span className="text-[#9FE1CB] text-[12px]">kcal</span>
          </div>
          <div className="bg-white/10 rounded-full px-4 py-2 flex items-center gap-2">
            <span className="text-[16px]">💪</span>
            <span className="text-white text-[14px] font-semibold">{mealPlan.proteinTarget}g</span>
            <span className="text-[#9FE1CB] text-[12px]">protein</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[12px]">
            <span className="text-[#9FE1CB]">Daily progress</span>
            <span className="text-[#9FE1CB]">{todayEatenCalories} / {mealPlan.calorieTarget} kcal</span>
          </div>
          <div className="w-full h-[6px] bg-white/15 rounded-full overflow-hidden">
            <div className="bg-[#C0DD97] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Wave */}
      <div className="bg-[#2D5A27] h-7" style={{ clipPath: 'ellipse(110% 100% at 50% 0%)' }} />

      {/* Body */}
      <div className="flex-1 px-5 pb-28 flex flex-col gap-5 overflow-y-auto">

        {/* Daily macros */}
<p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Today's macros</p>
<div className="flex flex-col gap-3 -mt-2">
  {[
    { icon: '💪', label: 'Protein', eaten: todayEatenProtein, target: today.p, color: '#2D5A27' },
    { icon: '🌾', label: 'Carbs', eaten: todayEatenCarbs, target: today.c, color: '#639922' },
    { icon: '🥑', label: 'Fat', eaten: todayEatenFat, target: today.f, color: '#888780' },
  ].map(({ icon, label, eaten, target, color }) => {
    const pct = Math.round((eaten / target) * 100)
const isOver = eaten > target
const barPct = Math.min(100, pct)
const overPct = isOver ? Math.min(100, Math.round(((eaten - target) / target) * 100)) : 0

return (
  <div key={label} className="bg-white rounded-[16px] border border-[#E8E6E0] p-4 flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-[18px]">{icon}</span>
        <span className="text-[14px] font-semibold text-[#2C2C2A]">{label}</span>
      </div>
      <div className="text-right">
        <span style={{ fontFamily: "'Playfair Display', serif", color: isOver ? '#E24B4A' : color }}
          className="text-[16px] font-bold">
          {eaten}g
        </span>
        <span className="text-[#B4B2A9] text-[13px]"> / {target}g</span>
        {isOver && <p className="text-[#E24B4A] text-[11px] font-semibold">+{eaten - target}g over</p>}
      </div>
    </div>
    <div className="w-full h-[6px] bg-[#F0EEE8] rounded-full overflow-hidden flex">
      <div className="h-full rounded-l-full transition-all duration-500"
        style={{ width: `${barPct}%`, backgroundColor: isOver ? '#E24B4A' : color }} />
      {isOver && (
        <div className="h-full rounded-r-full transition-all duration-500 bg-red-200"
          style={{ width: `${overPct}%` }} />
      )}
    </div>
    <p className="text-[11px]" style={{ color: isOver ? '#E24B4A' : '#B4B2A9' }}>
      {isOver ? `${pct}% of daily target` : `${target - eaten}g remaining`}
    </p>
  </div>
)
  })}
</div>

        {/* Today's meals */}
        <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Today's meals</p>
        <div className="bg-white rounded-[20px] border border-[#E8E6E0] px-4 py-2 -mt-2">
          {today.meals.map((meal, i) => {
            const eaten = isMealEaten(meal.name)
            return (
              <div key={i}
                onClick={() => navigate('/meal', { state: { meal } })}
                className={`flex items-center gap-3 py-3 cursor-pointer transition-opacity ${i < today.meals.length - 1 ? 'border-b border-[#F0EEE8]' : ''} ${eaten ? 'opacity-50' : ''}`}>
                <span className="text-[24px] w-9 text-center">{mealEmojis[meal.type] || '🍽️'}</span>
                <div className="flex-1">
                  <p className={`text-[#2C2C2A] text-[14px] font-semibold ${eaten ? 'line-through' : ''}`}>{meal.name}</p>
                  <p className="text-[#B4B2A9] text-[12px] font-medium capitalize">{meal.type}</p>
                </div>
                <span className="text-[#639922] text-[13px] font-semibold">
  {eaten ? (eatenMeals.find(e => e.meal_name === meal.name)?.calories || meal.cal) : meal.cal} kcal
</span>
                {eaten && <span className="text-[#2D5A27] text-[16px]">✓</span>}
                <span className="text-[#D3D1C7] text-[16px]">›</span>
              </div>
            )
          })}
        </div>

        {/* Budget */}
        <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Budget this week</p>
        <div className="bg-white rounded-[20px] border border-[#E8E6E0] p-4 -mt-2">
          <div className="flex justify-between items-start mb-1">
            <div>
              <p style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-[#2D5A27] text-[22px] font-bold">{mealPlan.weekCost} MDL</p>
              <p className="text-[#888780] text-[12px]">estimated cost</p>
            </div>
            <div className="text-right">
              <p className="text-[#5F5E5A] text-[13px] font-semibold">{profile?.budget || '—'} MDL</p>
              <p className="text-[#B4B2A9] text-[11px]">your budget</p>
            </div>
          </div>
          <div className="w-full h-[6px] bg-[#F0EEE8] rounded-full my-3">
            <div className="h-full bg-[#2D5A27] rounded-full" style={{ width: `${budgetPct}%` }} />
          </div>
          {profile?.budget && mealPlan.weekCost <= profile.budget && (
            <p className="text-[#639922] text-[12px] font-semibold">✓ You are within budget this week.</p>
          )}
        </div>

        {/* Quick actions */}
        <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Quick actions</p>
        <div className="grid grid-cols-2 gap-3 -mt-2">
          {[
            { icon: '📅', label: 'View full week', action: () => navigate('/plan'), primary: true },
            { icon: '🛒', label: 'Shopping list', action: () => navigate('/shopping') },
            { icon: '🔄', label: 'Regenerate plan', action: regeneratePlan },
            { icon: '⚙️', label: 'Preferences', action: () => navigate('/preferences') },
          ].map(({ icon, label, action, primary }) => (
            <button key={label} onClick={action}
              className={`flex flex-col items-start gap-2 p-4 rounded-[16px] border-[1.5px] transition ${primary ? 'bg-[#2D5A27] border-[#2D5A27]' : 'bg-white border-[#E8E6E0]'}`}>
              <span className="text-[20px]">{icon}</span>
              <span className={`text-[13px] font-semibold ${primary ? 'text-white' : 'text-[#2C2C2A]'}`}>{label}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}