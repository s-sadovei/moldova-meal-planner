import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Setup() {
  const navigate = useNavigate()
  const { saveProfile } = useApp()
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    name: '', age: '', gender: 'male', height: '', weight: '',
    activityLevel: 'moderate', goal: 'lose', mealsPerDay: 3,
    budget: '', likedFoods: '', dislikedFoods: '', allergies: '',
  })

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleFinish = () => {
    if (!form.name || !form.age || !form.height || !form.weight) {
      alert('Te rugăm să completezi toate câmpurile obligatorii.')
      return
    }
    saveProfile({
      ...form,
      age: Number(form.age),
      height: Number(form.height),
      weight: Number(form.weight),
      budget: Number(form.budget),
    })
    navigate('/dashboard')
  }

  const inputClass = "w-full bg-white border-[1.5px] border-[#E8E6E0] rounded-[14px] px-4 py-3.5 text-[14px] font-medium text-[#2C2C2A] outline-none focus:border-[#2D5A27]"
  const labelClass = "text-[12px] font-semibold text-[#5F5E5A] uppercase tracking-[0.8px]"

  const titles = ['Profilul\ntău.', 'Preferințe\nalimentare.', 'Buget.']
  const subs = [
    'Ajută-ne să îți creăm planul perfect de mese.',
    'Spune-ne ce îți place și noi facem restul.',
    'Îți vom menține mesele accesibile.',
  ]

  const ProgressBar = () => (
    <div className="flex gap-1 mt-4">
      {[1, 2, 3].map(s => (
        <div key={s} className={`flex-1 h-[3px] rounded-full transition-all ${s <= step ? 'bg-[#C0DD97]' : 'bg-white/20'}`} />
      ))}
    </div>
  )

  const Header = () => (
    <>
      <div className="bg-[#2D5A27] px-7 pt-12 pb-7 flex flex-col gap-2">
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)}
            className="self-start text-[#9FE1CB] text-[13px] font-medium mb-2">
            ← Înapoi
          </button>
        )}
        <h1 style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-white text-[36px] font-extrabold leading-[1.1] whitespace-pre-line">
          {titles[step - 1]}
        </h1>
        <p className="text-[#9FE1CB] text-[13px] font-medium leading-relaxed">{subs[step - 1]}</p>
        <ProgressBar />
      </div>
      <div className="bg-[#2D5A27] h-7" style={{ clipPath: 'ellipse(110% 100% at 50% 0%)' }} />
    </>
  )

  const ToggleGroup = ({ options, value, onChange }) => (
    <div className="flex gap-2">
      {options.map(([val, label]) => (
        <button key={val} onClick={() => onChange(val)}
          className={`flex-1 py-3 rounded-[12px] text-[13px] font-semibold border-[1.5px] transition ${value === val ? 'bg-[#2D5A27] text-white border-[#2D5A27]' : 'bg-white text-[#888780] border-[#E8E6E0]'}`}>
          {label}
        </button>
      ))}
    </div>
  )

  if (step === 1) return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">
      <Header />
      <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-y-auto">
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Informații de bază</p>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Nume</label>
            <input className={inputClass} placeholder="Numele tău" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Vârstă</label>
              <input className={inputClass} type="number" placeholder="25" value={form.age} onChange={e => set('age', e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Gen</label>
              <select className={inputClass} value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="male">Masculin</option>
                <option value="female">Feminin</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Înălțime (cm)</label>
              <input className={inputClass} type="number" placeholder="175" value={form.height} onChange={e => set('height', e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Greutate (kg)</label>
              <input className={inputClass} type="number" placeholder="75" value={form.weight} onChange={e => set('weight', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Obiectivul tău</p>
          <ToggleGroup
            options={[['lose', 'Slăbit'], ['maintain', 'Menținere'], ['build', 'Masă']]}
            value={form.goal} onChange={v => set('goal', v)} />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Nivel de activitate</p>
          <div className="flex flex-col gap-2">
            {[
              ['sedentary', 'Sedentar', 'Puțin sau deloc sport'],
              ['light', 'Ușor', '1–3 zile/săptămână'],
              ['moderate', 'Moderat', '3–5 zile/săptămână'],
              ['active', 'Activ', '6–7 zile/săptămână'],
            ].map(([val, label, desc]) => (
              <button key={val} onClick={() => set('activityLevel', val)}
                className={`w-full flex justify-between items-center px-4 py-3 rounded-[14px] border-[1.5px] transition ${form.activityLevel === val ? 'bg-[#EAF3DE] border-[#C0DD97]' : 'bg-white border-[#E8E6E0]'}`}>
                <span className={`text-[14px] font-semibold ${form.activityLevel === val ? 'text-[#2D5A27]' : 'text-[#5F5E5A]'}`}>{label}</span>
                <span className={`text-[12px] ${form.activityLevel === val ? 'text-[#639922]' : 'text-[#B4B2A9]'}`}>{desc}</span>
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => setStep(2)}
          className="w-full bg-[#2D5A27] text-white font-semibold text-[15px] py-4 rounded-2xl">
          Înainte →
        </button>
        <p className="text-[12px] text-[#B4B2A9] text-center">Pasul 1 din 3</p>
      </div>
    </div>
  )

  if (step === 2) return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">
      <Header />
      <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-y-auto">

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Alimente preferate</label>
          <input className={inputClass} placeholder="ex: orez, cartofi, ovăz"
            value={form.likedFoods} onChange={e => set('likedFoods', e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Alimente evitate</label>
          <input className={inputClass} placeholder="ex: varză, pește"
            value={form.dislikedFoods} onChange={e => set('dislikedFoods', e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Alergii / restricții</label>
          <input className={inputClass} placeholder="ex: intolerant la lactoză"
            value={form.allergies} onChange={e => set('allergies', e.target.value)} />
        </div>

        <button onClick={() => setStep(3)}
          className="w-full bg-[#2D5A27] text-white font-semibold text-[15px] py-4 rounded-2xl">
          Înainte →
        </button>
        <p className="text-[12px] text-[#B4B2A9] text-center">Pasul 2 din 3</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">
      <Header />
      <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-y-auto">

        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Buget săptămânal</p>
          <div className="flex flex-col gap-2">
            {[
              { label: '600 – 700 MDL', value: 700 },
              { label: '700 – 800 MDL', value: 800 },
              { label: '800 – 900 MDL', value: 900 },
              { label: '900 – 1000 MDL', value: 1000 },
              { label: '1000 – 1100 MDL', value: 1100 },
              { label: '1100 – 1200 MDL', value: 1200 },
              { label: '1200+ MDL', value: 9999 },
            ].map(({ label, value }) => (
              <button key={value} onClick={() => {
                set('budget', value)
                if (value < 700 && form.mealsPerDay === 5) set('mealsPerDay', 4)
              }}
                className={`w-full flex justify-between items-center px-4 py-3 rounded-[14px] border-[1.5px] transition ${form.budget === value ? 'bg-[#EAF3DE] border-[#C0DD97]' : 'bg-white border-[#E8E6E0]'}`}>
                <span className={`text-[14px] font-semibold ${form.budget === value ? 'text-[#2D5A27]' : 'text-[#5F5E5A]'}`}>{label}</span>
                {form.budget === value && <span className="text-[#2D5A27] text-[16px]">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Mese pe zi</p>
          <ToggleGroup
            options={[
              ['2', '2'],
              ['3', '3'],
              ['4', '4'],
              ...(form.budget >= 700 ? [['5', '5']] : []),
            ]}
            value={String(form.mealsPerDay)}
            onChange={v => set('mealsPerDay', Number(v))} />
          {form.budget < 700 && form.budget !== '' && (
            <p className="text-[11px] text-[#888780]">5 mese pe zi necesită un buget de minim 700 MDL.</p>
          )}
        </div>

        <button onClick={handleFinish}
          disabled={!form.budget}
          className="w-full bg-[#2D5A27] text-white font-semibold text-[15px] py-4 rounded-2xl disabled:opacity-50">
          Generează planul meu 🎉
        </button>
        <p className="text-[12px] text-[#B4B2A9] text-center">Pasul 3 din 3</p>
      </div>
    </div>
  )
}