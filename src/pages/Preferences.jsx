import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { getRecipeById } from '../utils/recipeDatabase'

export default function Preferences() {
  const navigate = useNavigate()
  const { user, profile, mealPlan, saveProfile, logout, favoriteRecipes, toggleFavoriteRecipe } = useApp()

  const [form, setForm] = useState({ ...profile })
  const [saved, setSaved] = useState(false)

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSave = () => {
    saveProfile({
      ...form,
      age: Number(form.age),
      height: Number(form.height),
      weight: Number(form.weight),
      budget: Number(form.budget),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  const goalLabels = { lose: 'Slăbit', maintain: 'Menținere', build: 'Masă musculară' }
  const activityLabels = { sedentary: 'Sedentar', light: 'Ușor', moderate: 'Moderat', active: 'Activ' }
  const activityDesc = { sedentary: 'Puțin sau deloc sport', light: '1–3 zile/săptămână', moderate: '3–5 zile/săptămână', active: '6–7 zile/săptămână' }

  const [editing, setEditing] = useState(null)

  const inputClass = "w-full bg-[#F7F5F0] border-[1.5px] border-[#E8E6E0] rounded-[14px] px-4 py-3 text-[14px] font-medium text-[#2C2C2A] outline-none focus:border-[#2D5A27]"
  const labelClass = "text-[12px] font-semibold text-[#5F5E5A] uppercase tracking-[0.8px] mb-1 block"

  const SettingRow = ({ icon, label, value, editKey, children }) => (
    <div>
      <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
        onClick={() => setEditing(editing === editKey ? null : editKey)}>
        <div className="w-9 h-9 bg-[#F7F5F0] rounded-[10px] flex items-center justify-center text-[20px] flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-[#2C2C2A]">{label}</p>
          <p className="text-[12px] text-[#B4B2A9] font-medium mt-0.5">{value}</p>
        </div>
        <span className="text-[#D3D1C7] text-[18px]">{editing === editKey ? '↑' : '›'}</span>
      </div>
      {editing === editKey && (
        <div className="px-4 pb-4 border-t border-[#F0EEE8] pt-3">
          {children}
        </div>
      )}
    </div>
  )

  const ToggleGroup = ({ options, value, onChange }) => (
    <div className="flex gap-2">
      {options.map(([val, label]) => (
        <button key={val} onClick={() => onChange(val)}
          className={`flex-1 py-2.5 rounded-[12px] text-[13px] font-semibold border-[1.5px] transition ${value === val ? 'bg-[#2D5A27] text-white border-[#2D5A27]' : 'bg-white text-[#888780] border-[#E8E6E0]'}`}>
          {label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">

      {/* Header */}
      <div className="bg-[#2D5A27] px-6 pt-12 pb-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#C0DD97] flex items-center justify-center flex-shrink-0">
            <span style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-[#2D5A27] text-[24px] font-extrabold">{initials}</span>
          </div>
          <div>
            <p style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-white text-[26px] font-extrabold leading-tight">{profile?.name}</p>
            <p className="text-[#9FE1CB] text-[13px] font-medium mt-1">{user?.email}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {[
            { val: `${profile?.weight} kg`, label: 'greutate' },
            { val: `${mealPlan?.calorieTarget || '—'}`, label: 'kcal/zi' },
            { val: `${profile?.budget} MDL`, label: 'buget' },
          ].map(({ val, label }) => (
            <div key={label} className="flex-1 bg-white/10 rounded-[14px] px-3 py-2">
              <p className="text-white text-[15px] font-bold">{val}</p>
              <p className="text-[#9FE1CB] text-[11px]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wave */}
      <div className="bg-[#2D5A27] h-7" style={{ clipPath: 'ellipse(110% 100% at 50% 0%)' }} />

      {/* Body */}
      <div className="flex-1 px-5 pb-28 flex flex-col gap-4 overflow-y-auto">

        {/* Account */}
        <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Cont</p>
        <div className="bg-white rounded-[20px] border border-[#E8E6E0] overflow-hidden -mt-2">
          <SettingRow icon="👤" label="Nume" value={form.name || '—'} editKey="name">
            <div>
              <label className={labelClass}>Numele tău</label>
              <input className={inputClass} placeholder="ex: Ion Popescu" value={form.name || ''} onChange={e => set('name', e.target.value)} />
            </div>
          </SettingRow>
        </div>

        {/* Goal */}
        <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Obiectivul meu</p>
        <div className="bg-white rounded-[20px] border border-[#E8E6E0] overflow-hidden -mt-2">
          <SettingRow icon="🎯" label="Obiectiv fitness" value={goalLabels[form.goal]} editKey="goal">
            <ToggleGroup
              options={[['lose', 'Slăbit'], ['maintain', 'Menținere'], ['build', 'Masă']]}
              value={form.goal} onChange={v => set('goal', v)} />
          </SettingRow>
          <div className="h-px bg-[#F0EEE8]" />
          <SettingRow icon="🏃" label="Nivel de activitate" value={`${activityLabels[form.activityLevel]} · ${activityDesc[form.activityLevel]}`} editKey="activity">
            <div className="flex flex-col gap-2">
              {[
                ['sedentary', 'Sedentar', 'Puțin sau deloc sport'],
                ['light', 'Ușor', '1–3 zile/săptămână'],
                ['moderate', 'Moderat', '3–5 zile/săptămână'],
                ['active', 'Activ', '6–7 zile/săptămână'],
              ].map(([val, label, desc]) => (
                <button key={val} onClick={() => set('activityLevel', val)}
                  className={`w-full flex justify-between items-center px-4 py-3 rounded-[12px] border-[1.5px] transition ${form.activityLevel === val ? 'bg-[#EAF3DE] border-[#C0DD97]' : 'bg-white border-[#E8E6E0]'}`}>
                  <span className={`text-[13px] font-semibold ${form.activityLevel === val ? 'text-[#2D5A27]' : 'text-[#5F5E5A]'}`}>{label}</span>
                  <span className={`text-[12px] ${form.activityLevel === val ? 'text-[#639922]' : 'text-[#B4B2A9]'}`}>{desc}</span>
                </button>
              ))}
            </div>
          </SettingRow>
          <div className="h-px bg-[#F0EEE8]" />
          <SettingRow icon="🍽️" label="Mese pe zi" value={`${form.mealsPerDay} mese`} editKey="meals">
            <ToggleGroup
              options={[['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']]}
              value={String(form.mealsPerDay)} onChange={v => set('mealsPerDay', Number(v))} />
          </SettingRow>
        </div>

        {/* Body */}
        <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Corp și nutriție</p>
        <div className="bg-white rounded-[20px] border border-[#E8E6E0] overflow-hidden -mt-2">
          <SettingRow icon="⚖️" label="Greutate" value={`${form.weight} kg`} editKey="weight">
            <div>
              <label className={labelClass}>Greutate (kg)</label>
              <input className={inputClass} type="number" value={form.weight} onChange={e => set('weight', e.target.value)} />
            </div>
          </SettingRow>
          <div className="h-px bg-[#F0EEE8]" />
          <SettingRow icon="📏" label="Înălțime" value={`${form.height} cm`} editKey="height">
            <div>
              <label className={labelClass}>Înălțime (cm)</label>
              <input className={inputClass} type="number" value={form.height} onChange={e => set('height', e.target.value)} />
            </div>
          </SettingRow>
          <div className="h-px bg-[#F0EEE8]" />
          <SettingRow icon="💰" label="Buget săptămânal" value={`${form.budget} MDL`} editKey="budget">
            <div>
              <label className={labelClass}>Buget (MDL)</label>
              <input className={inputClass} type="number" value={form.budget} onChange={e => set('budget', e.target.value)} />
            </div>
          </SettingRow>
        </div>

        {/* Food preferences */}
        <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Preferințe alimentare</p>
        <div className="bg-white rounded-[20px] border border-[#E8E6E0] overflow-hidden -mt-2">
          <SettingRow icon="👍" label="Alimente preferate" value={form.likedFoods || 'Neselectat'} editKey="likes">
            <div>
              <label className={labelClass}>Alimente pe care le preferi</label>
              <input className={inputClass} placeholder="ex: orez, pui, ouă" value={form.likedFoods || ''} onChange={e => set('likedFoods', e.target.value)} />
            </div>
          </SettingRow>
          <div className="h-px bg-[#F0EEE8]" />
          <SettingRow icon="🚫" label="Alimente evitate" value={form.dislikedFoods || 'Neselectat'} editKey="dislikes">
            <div>
              <label className={labelClass}>Alimente pe care nu le consumi</label>
              <input className={inputClass} placeholder="ex: varză, pește" value={form.dislikedFoods || ''} onChange={e => set('dislikedFoods', e.target.value)} />
            </div>
          </SettingRow>
          <div className="h-px bg-[#F0EEE8]" />
          <SettingRow icon="⚠️" label="Alergii" value={form.allergies || 'Neselectat'} editKey="allergies">
            <div>
              <label className={labelClass}>Alergii sau restricții</label>
              <input className={inputClass} placeholder="ex: intolerant la lactoză" value={form.allergies || ''} onChange={e => set('allergies', e.target.value)} />
            </div>
          </SettingRow>
        </div>

        <button onClick={handleSave}
          className="w-full bg-[#2D5A27] text-white font-semibold text-[15px] py-4 rounded-2xl transition">
          {saved ? '✓ Salvat și plan regenerat!' : 'Salvează și regenerează planul'}
        </button>

        {/* Favorites */}
{favoriteRecipes.length > 0 && (
  <>
    <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Rețete favorite</p>
    <div className="bg-white rounded-[20px] border border-[#E8E6E0] overflow-hidden -mt-2">
      {favoriteRecipes.map((recipeId, i) => {
        const recipe = getRecipeById(recipeId)
        if (!recipe) return null
        return (
          <div key={recipeId}>
            <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
              onClick={() => navigate('/meal', { state: { meal: {
                id: recipe.id,
                name: recipe.name,
                type: recipe.type,
                cal: recipe.baseCalories,
                p: recipe.baseMacros.p,
                c: recipe.baseMacros.c,
                f: recipe.baseMacros.f,
                cost: recipe.baseCost,
                ingredients: recipe.ingredients.map(ing => ({
                  food: ing.key,
                  amount: ing.amount,
                  unit: ing.unit,
                  key: ing.key,
                  displayName: ing.name,
                })),
                steps: recipe.steps,
              }, fromFavorites: true } })}>
              <div className="w-9 h-9 bg-[#F7F5F0] rounded-[10px] flex items-center justify-center text-[20px] flex-shrink-0">
                {recipe.type === 'breakfast' ? '🌅' : recipe.type === 'lunch' ? '🍗' : recipe.type === 'dinner' ? '🐟' : '🥛'}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-[#2C2C2A]">{recipe.name}</p>
                <p className="text-[12px] text-[#B4B2A9] font-medium mt-0.5">{recipe.baseCalories} kcal · {recipe.baseCost} MDL</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); toggleFavoriteRecipe(recipeId) }}
                className="text-[20px]">
                ❤️
              </button>
            </div>
            {i < favoriteRecipes.length - 1 && <div className="h-px bg-[#F0EEE8] mx-4" />}
          </div>
        )
      })}
    </div>
  </>
)}

        <button onClick={logout}
          className="w-full bg-white text-[#E24B4A] font-semibold text-[15px] py-4 rounded-2xl border-[1.5px] border-[#F7C1C1]">
          Deconectează-te
        </button>

      </div>
    </div>
  )
}