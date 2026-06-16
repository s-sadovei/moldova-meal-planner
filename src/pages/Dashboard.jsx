import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getAveragePriceForIngredient } from '../utils/moldovanProducts'

const mealEmojis = { breakfast: '🌅', lunch: '🍗', dinner: '🐟', snack: '🥛' }
const mealTypeRo = { breakfast: 'Mic dejun', lunch: 'Prânz', dinner: 'Cină', snack: 'Gustare' }

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile, mealPlan, regeneratePlan, todayEatenCalories, todayDayIndex, isMealEaten, eatenMeals, showNewWeekPrompt, setShowNewWeekPrompt, resetShoppingList, getBrandPreference } = useApp()

  if (!mealPlan) return null

  const today = mealPlan.weekPlan[todayDayIndex] || mealPlan.weekPlan[0]
  const progressPct = Math.min(100, (todayEatenCalories / mealPlan.calorieTarget) * 100)
  const todayDate = new Date().toISOString().split('T')[0]
  const todayEaten = eatenMeals.filter(e => e.eaten_date === todayDate)
  const todayEatenProtein = todayEaten.reduce((sum, e) => sum + (Number(e.protein) || 0), 0)
  const todayEatenCarbs = todayEaten.reduce((sum, e) => sum + (Number(e.carbs) || 0), 0)
  const todayEatenFat = todayEaten.reduce((sum, e) => sum + (Number(e.fat) || 0), 0)

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">

      {/* New week prompt */}
      {showNewWeekPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-[24px] p-6 flex flex-col gap-4 w-full max-w-sm">
            <div className="text-center">
              <p className="text-[32px]">🎉</p>
              <p style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-[#2D5A27] text-[22px] font-extrabold mt-2">Săptămână nouă!</p>
              <p className="text-[#888780] text-[14px] mt-1">Dorești să generezi un plan nou pentru această săptămână?</p>
            </div>
            <button onClick={() => { regeneratePlan(); setShowNewWeekPrompt(false) }}
              className="w-full bg-[#2D5A27] text-white font-semibold text-[15px] py-4 rounded-2xl">
              Da, generează plan nou
            </button>
            <button onClick={() => { resetShoppingList(); setShowNewWeekPrompt(false) }}
              className="w-full bg-[#F7F5F0] text-[#5F5E5A] font-semibold text-[15px] py-4 rounded-2xl">
              Păstrează planul actual
            </button>
          </div>
        </div>
      )}

      {/* Budget warning */}
      {mealPlan?.budgetWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-[24px] p-6 flex flex-col gap-4 w-full max-w-sm">
            <div className="text-center">
              <p className="text-[32px]">⚠️</p>
              <p style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-[#2D5A27] text-[22px] font-extrabold mt-2">Buget insuficient</p>
              <p className="text-[#888780] text-[14px] mt-1">Nu am putut genera un plan complet în bugetul selectat. Încearcă un buget mai mare sau reduce numărul de mese pe zi.</p>
            </div>
            <button onClick={() => navigate('/preferences')}
              className="w-full bg-[#2D5A27] text-white font-semibold text-[15px] py-4 rounded-2xl">
              Modifică bugetul
            </button>
            <button onClick={() => regeneratePlan()}
              className="w-full bg-[#F7F5F0] text-[#5F5E5A] font-semibold text-[15px] py-4 rounded-2xl">
              Încearcă din nou
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
              Salut, {profile?.name} 👋
            </h1>
            <p className="text-[#9FE1CB] text-[13px] font-medium mt-1">Iată planul tău pentru azi.</p>
          </div>
          <span className="bg-[#C0DD97] text-[#2D5A27] text-[11px] font-bold px-3 py-1.5 rounded-full">Activ</span>
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
            <span className="text-[#9FE1CB] text-[12px]">proteină</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[12px]">
            <span className="text-[#9FE1CB]">Progres zilnic</span>
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
        <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Macronutrienți azi</p>
        <div className="flex flex-col gap-3 -mt-2">
          {[
            { icon: '💪', label: 'Proteină', eaten: todayEatenProtein, target: today.p, color: '#639922' },
            { icon: '🌾', label: 'Carbohidrați', eaten: todayEatenCarbs, target: today.c, color: '#639922' },
            { icon: '🥑', label: 'Grăsimi', eaten: todayEatenFat, target: today.f, color: '#639922' },
          ].map(({ icon, label, eaten, target, color }) => {
            const pct = Math.round((eaten / target) * 100)
            const isOver = eaten > target
            const total = isOver ? eaten : target
            const greenPct = Math.round((Math.min(eaten, target) / total) * 100)
            const redPct = isOver ? Math.round(((eaten - target) / total) * 100) : 0

            return (
              <div key={label} className="bg-white rounded-[16px] border border-[#E8E6E0] p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[18px]">{icon}</span>
                    <span className="text-[14px] font-semibold text-[#2C2C2A]">{label}</span>
                  </div>
                  <div className="text-right">
                    <span style={{ fontFamily: "'Playfair Display', serif", color: isOver ? '#D97706' : color }}
                      className="text-[16px] font-bold">
                      {eaten}g
                    </span>
                    <span className="text-[#B4B2A9] text-[13px]"> / {target}g</span>
                    {isOver && <p className="text-[11px] font-semibold" style={{ color: '#D97706' }}>+{(eaten - target).toFixed(1)}g peste</p>}
                  </div>
                </div>
                <div className="w-full h-[6px] bg-[#F0EEE8] rounded-full overflow-hidden flex">
                  <div className="h-full transition-all duration-500"
                    style={{ width: `${greenPct}%`, backgroundColor: color, borderRadius: isOver ? '9999px 0 0 9999px' : '9999px' }} />
                  {isOver && (
                    <div className="h-full transition-all duration-500"
                      style={{ width: `${redPct}%`, backgroundColor: '#D97706', borderRadius: '0 9999px 9999px 0' }} />
                  )}
                </div>
                <p className="text-[11px]" style={{ color: isOver ? '#D97706' : '#B4B2A9' }}>
                  {isOver ? `${pct}% din ținta zilnică` : `${(target - eaten).toFixed(1)}g rămase`}
                </p>
              </div>
            )
          })}
        </div>

        {/* Today's meals */}
        <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Mesele de azi</p>
        <div className="bg-white rounded-[20px] border border-[#E8E6E0] px-4 py-2 -mt-2">
          {today.meals.map((meal, i) => {
            const eaten = isMealEaten(meal.name)
            return (
              <div key={i}
                onClick={() => navigate('/meal', { state: { meal, fromDay: todayDayIndex } })}
                className={`flex items-center gap-3 py-3 cursor-pointer transition-opacity ${i < today.meals.length - 1 ? 'border-b border-[#F0EEE8]' : ''} ${eaten ? 'opacity-50' : ''}`}>
                <span className="text-[24px] w-9 text-center">{mealEmojis[meal.type] || '🍽️'}</span>
                <div className="flex-1">
                  <p className={`text-[#2C2C2A] text-[14px] font-semibold ${eaten ? 'line-through' : ''}`}>{meal.name}</p>
                  <p className="text-[#B4B2A9] text-[12px] font-medium">{mealTypeRo[meal.type] || meal.type}</p>
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
        <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Buget săptămânal</p>
        <div className="bg-white rounded-[20px] border border-[#E8E6E0] p-4 -mt-2">
          {(() => {
            const weeklyBudget = profile?.budget || 0
            const shoppingList = mealPlan?.shoppingList || []
            const getEffectivePrice = (item) => {
  const key = item.ingredientKey || item.name.toLowerCase()
  const pref = getBrandPreference(key)
  const amount = item.amount || 100
  if (pref) {
    return Math.round(pref.price * amount / 100 * 10) / 10
  }
  const avgPrice = getAveragePriceForIngredient(key)
  if (avgPrice) {
    return Math.round(avgPrice * amount / 100 * 10) / 10
  }
  return item.estimatedPrice || 0
}

const spentSoFar = shoppingList
  .filter(i => i.bought)
  .reduce((sum, i) => sum + getEffectivePrice(i), 0)
const totalCost = shoppingList
  .filter(i => !i.atHome)
  .reduce((sum, i) => sum + getEffectivePrice(i), 0)
            const budgetSpentPct = weeklyBudget ? Math.min(100, (spentSoFar / weeklyBudget) * 100) : 0
            const budgetEstimatePct = weeklyBudget ? Math.min(100, (totalCost / weeklyBudget) * 100) : 0
            const isOverBudget = spentSoFar > weeklyBudget
            const isEstimateOver = totalCost > weeklyBudget
            const budgetRemaining = weeklyBudget - spentSoFar

            return (
              <>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p style={{ fontFamily: "'Playfair Display', serif", color: isOverBudget ? '#E24B4A' : '#2D5A27' }}
                      className="text-[22px] font-bold">
                      {spentSoFar.toFixed(2)} MDL
                    </p>
                    <p className="text-[#888780] text-[12px]">cheltuit până acum</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#5F5E5A] text-[13px] font-semibold">
  {weeklyBudget === 9999 ? '1200+ MDL' : `${weeklyBudget - 100}–${weeklyBudget} MDL`}
</p>
<p className="text-[#B4B2A9] text-[11px]">buget săptămânal</p>
                  </div>
                </div>
                <div className="w-full h-[6px] bg-[#F0EEE8] rounded-full overflow-hidden relative mb-1">
                  <div className="absolute h-full rounded-full transition-all duration-300"
                    style={{ width: `${budgetEstimatePct}%`, backgroundColor: isEstimateOver ? '#fca5a5' : '#E8F5D0' }} />
                  <div className="absolute h-full rounded-full transition-all duration-300"
                    style={{ width: `${budgetSpentPct}%`, backgroundColor: isOverBudget ? '#E24B4A' : '#2D5A27' }} />
                </div>
                <p className="text-[11px] text-[#B4B2A9] mb-2">Estimat: {totalCost.toFixed(2)} MDL</p>
                {isOverBudget ? (
                  <p className="text-[#E24B4A] text-[12px] font-semibold">⚠️ {Math.abs(budgetRemaining).toFixed(2)} MDL peste buget!</p>
                ) : isEstimateOver ? (
                  <p className="text-[#E24B4A] text-[12px] font-semibold">⚠️ Estimatul depășește bugetul cu {(totalCost - weeklyBudget).toFixed(2)} MDL</p>
                ) : (
                  <p className="text-[#639922] text-[12px] font-semibold">✓ {budgetRemaining.toFixed(2)} MDL rămași în buget</p>
                )}
              </>
            )
          })()}
        </div>

        {/* Quick actions */}
        <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Acțiuni rapide</p>
        <div className="grid grid-cols-2 gap-3 -mt-2">
          {[
            { icon: '📅', label: 'Vezi săptămâna', action: () => navigate('/plan'), primary: true },
            { icon: '🛒', label: 'Listă cumpărături', action: () => navigate('/shopping') },
            { icon: '🔄', label: 'Regenerează', action: regeneratePlan },
            { icon: '⚙️', label: 'Preferințe', action: () => navigate('/preferences') },
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