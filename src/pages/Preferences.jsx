import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Preferences() {
  const { user, profile, saveProfile, logout } = useApp()
  const [form, setForm] = useState({ ...profile })
  const [saved, setSaved] = useState(false)

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const toggleProtein = (p) => {
    setForm(prev => ({
      ...prev,
      proteins: prev.proteins.includes(p)
        ? prev.proteins.filter(x => x !== p)
        : [...prev.proteins, p]
    }))
  }

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

  const goalLabels = { lose: 'Lose fat', maintain: 'Maintain', build: 'Build muscle' }
  const activityLabels = { sedentary: 'Sedentary', light: 'Light', moderate: 'Moderate', active: 'Active' }
  const activityDesc = { sedentary: 'Little or no exercise', light: '1–3 days/week', moderate: '3–5 days/week', active: '6–7 days/week' }
  const cookingTimeLabels = { '<15': 'Under 15 min', '15-30': '15–30 minutes', '30-60': '30–60 minutes' }

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
            { val: `${profile?.weight} kg`, label: 'weight' },
            { val: `${profile?.age || '—'}`, label: 'age' },
            { val: `${profile?.budget} MDL`, label: 'budget' },
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

        {/* Goal */}
        <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">My goal</p>
        <div className="bg-white rounded-[20px] border border-[#E8E6E0] overflow-hidden -mt-2">
          <SettingRow icon="🎯" label="Fitness goal" value={goalLabels[form.goal]} editKey="goal">
            <ToggleGroup
              options={[['lose', 'Lose fat'], ['maintain', 'Maintain'], ['build', 'Build']]}
              value={form.goal} onChange={v => set('goal', v)} />
          </SettingRow>
          <div className="h-px bg-[#F0EEE8]" />
          <SettingRow icon="🏃" label="Activity level" value={`${activityLabels[form.activityLevel]} · ${activityDesc[form.activityLevel]}`} editKey="activity">
            <div className="flex flex-col gap-2">
              {[['sedentary', 'Sedentary', 'Little or no exercise'], ['light', 'Light', '1–3 days/week'], ['moderate', 'Moderate', '3–5 days/week'], ['active', 'Active', '6–7 days/week']].map(([val, label, desc]) => (
                <button key={val} onClick={() => set('activityLevel', val)}
                  className={`w-full flex justify-between items-center px-4 py-3 rounded-[12px] border-[1.5px] transition ${form.activityLevel === val ? 'bg-[#EAF3DE] border-[#C0DD97]' : 'bg-white border-[#E8E6E0]'}`}>
                  <span className={`text-[13px] font-semibold ${form.activityLevel === val ? 'text-[#2D5A27]' : 'text-[#5F5E5A]'}`}>{label}</span>
                  <span className={`text-[12px] ${form.activityLevel === val ? 'text-[#639922]' : 'text-[#B4B2A9]'}`}>{desc}</span>
                </button>
              ))}
            </div>
          </SettingRow>
          <div className="h-px bg-[#F0EEE8]" />
          <SettingRow icon="🍽️" label="Meals per day" value={`${form.mealsPerDay} meals`} editKey="meals">
            <ToggleGroup
              options={[['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']]}
              value={String(form.mealsPerDay)} onChange={v => set('mealsPerDay', Number(v))} />
          </SettingRow>
        </div>

        {/* Body */}
        <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Body & nutrition</p>
        <div className="bg-white rounded-[20px] border border-[#E8E6E0] overflow-hidden -mt-2">
          <SettingRow icon="⚖️" label="Weight" value={`${form.weight} kg`} editKey="weight">
            <div>
              <label className={labelClass}>Weight (kg)</label>
              <input className={inputClass} type="number" value={form.weight} onChange={e => set('weight', e.target.value)} />
            </div>
          </SettingRow>
          <div className="h-px bg-[#F0EEE8]" />
          <SettingRow icon="📏" label="Height" value={`${form.height} cm`} editKey="height">
            <div>
              <label className={labelClass}>Height (cm)</label>
              <input className={inputClass} type="number" value={form.height} onChange={e => set('height', e.target.value)} />
            </div>
          </SettingRow>
          <div className="h-px bg-[#F0EEE8]" />
          <SettingRow icon="💰" label="Weekly budget" value={`${form.budget} MDL`} editKey="budget">
            <div>
              <label className={labelClass}>Budget (MDL)</label>
              <input className={inputClass} type="number" value={form.budget} onChange={e => set('budget', e.target.value)} />
            </div>
          </SettingRow>
        </div>

        {/* Food preferences */}
        <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Food preferences</p>
        <div className="bg-white rounded-[20px] border border-[#E8E6E0] overflow-hidden -mt-2">
          <SettingRow icon="🍗" label="Preferred proteins"
            value={form.proteins.length ? form.proteins.slice(0, 3).join(', ') : 'None set'} editKey="proteins">
            <div className="flex flex-wrap gap-2">
              {[['Chicken', '🍗'], ['Eggs', '🥚'], ['Tuna', '🐟'], ['Cottage cheese', '🧀'], ['Beans', '🫘'], ['Beef', '🥩'], ['Pork', '🐷'], ['Fish', '🐠'], ['Greek yogurt', '🥛']].map(([p, emoji]) => (
                <button key={p} onClick={() => toggleProtein(p)}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium border-[1.5px] transition ${form.proteins.includes(p) ? 'bg-[#EAF3DE] text-[#2D5A27] border-[#C0DD97]' : 'bg-white text-[#5F5E5A] border-[#E8E6E0]'}`}>
                  {emoji} {p}
                </button>
              ))}
            </div>
          </SettingRow>
          <div className="h-px bg-[#F0EEE8]" />
          <SettingRow icon="🚫" label="Disliked foods" value={form.dislikedFoods || 'None set'} editKey="dislikes">
            <div>
              <label className={labelClass}>Foods you dislike</label>
              <input className={inputClass} placeholder="e.g. cabbage, fish" value={form.dislikedFoods} onChange={e => set('dislikedFoods', e.target.value)} />
            </div>
          </SettingRow>
          <div className="h-px bg-[#F0EEE8]" />
          <SettingRow icon="⚠️" label="Allergies" value={form.allergies || 'None set'} editKey="allergies">
            <div>
              <label className={labelClass}>Allergies or restrictions</label>
              <input className={inputClass} placeholder="e.g. lactose intolerant" value={form.allergies} onChange={e => set('allergies', e.target.value)} />
            </div>
          </SettingRow>
        </div>

        {/* Cooking */}
        <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Cooking</p>
        <div className="bg-white rounded-[20px] border border-[#E8E6E0] overflow-hidden -mt-2">
          <SettingRow icon="👨‍🍳" label="Cooking skill" value={form.cookingSkill.charAt(0).toUpperCase() + form.cookingSkill.slice(1)} editKey="skill">
            <ToggleGroup
              options={[['beginner', 'Beginner'], ['intermediate', 'Medium'], ['advanced', 'Advanced']]}
              value={form.cookingSkill} onChange={v => set('cookingSkill', v)} />
          </SettingRow>
          <div className="h-px bg-[#F0EEE8]" />
          <SettingRow icon="⏱️" label="Cooking time" value={cookingTimeLabels[form.cookingTime]} editKey="time">
            <div className="flex flex-col gap-2">
              {[['<15', 'Under 15 min'], ['15-30', '15–30 minutes'], ['30-60', '30–60 minutes']].map(([val, label]) => (
                <button key={val} onClick={() => set('cookingTime', val)}
                  className={`w-full flex justify-between items-center px-4 py-3 rounded-[12px] border-[1.5px] transition ${form.cookingTime === val ? 'bg-[#EAF3DE] border-[#C0DD97]' : 'bg-white border-[#E8E6E0]'}`}>
                  <span className={`text-[13px] font-semibold ${form.cookingTime === val ? 'text-[#2D5A27]' : 'text-[#5F5E5A]'}`}>{label}</span>
                  {form.cookingTime === val && <span className="text-[#2D5A27]">✓</span>}
                </button>
              ))}
            </div>
          </SettingRow>
        </div>

        <button onClick={handleSave}
          className="w-full bg-[#2D5A27] text-white font-semibold text-[15px] py-4 rounded-2xl transition">
          {saved ? '✓ Saved & Plan Regenerated!' : 'Save & Regenerate Plan'}
        </button>

        <button onClick={logout}
          className="w-full bg-white text-[#E24B4A] font-semibold text-[15px] py-4 rounded-2xl border-[1.5px] border-[#F7C1C1]">
          Log Out
        </button>

      </div>
    </div>
  )
}