import { useNavigate } from 'react-router-dom'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center px-6">
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <div className="w-full max-w-sm bg-[#F7F5F0] rounded-[40px] overflow-hidden flex flex-col">

        {/* Hero */}
        <div className="bg-[#2D5A27] px-7 pt-14 pb-9 flex flex-col gap-4">
          <span className="self-start bg-white/10 text-[#C0DD97] text-[12px] font-600 px-3 py-1 rounded-full tracking-widest uppercase">
            Moldova Meal Planner
          </span>
          <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-white text-[42px] leading-[1.1] font-extrabold">
            Eat smart.<br />Stay on<br />budget.
          </h1>
          <p className="text-[#9FE1CB] text-[15px] leading-relaxed font-medium">
            AI-generated weekly meal plans using real foods from Moldovan markets.
          </p>
        </div>

        {/* Wave */}
        <div className="bg-[#2D5A27] h-8" style={{ clipPath: 'ellipse(110% 100% at 50% 0%)' }} />

        {/* Content */}
        <div className="px-6 pb-10 flex flex-col gap-5 bg-[#F7F5F0]">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { icon: '🥗', value: '7', label: 'days planned' },
              { icon: '💰', value: 'MDL', label: 'budget aware' },
              { icon: '💪', value: '3', label: 'fitness goals' },
            ].map(({ icon, value, label }) => (
              <div key={label} className="bg-white rounded-[18px] border border-[#E8E6E0] py-4 px-2 flex flex-col items-center gap-2">
                <span className="text-[32px]">{icon}</span>
                <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-[#2D5A27] text-[18px] font-bold">{value}</span>
                <span className="text-[#888780] text-[11px] font-medium text-center">{label}</span>
              </div>
            ))}
          </div>

          {/* Sample day */}
          <div className="bg-white rounded-[20px] border border-[#E8E6E0] p-4 flex flex-col gap-4">
            <p className="text-[#888780] text-[12px] font-semibold uppercase tracking-widest">Sample day</p>
            {[
              { emoji: '🌅', name: 'Oatmeal with banana', type: 'Breakfast', kcal: '380 kcal' },
              { emoji: '🍗', name: 'Chicken with rice', type: 'Lunch', kcal: '520 kcal' },
              { emoji: '🐟', name: 'Tuna with potatoes', type: 'Dinner', kcal: '440 kcal' },
              { emoji: '🥛', name: 'Cottage cheese', type: 'Snack', kcal: '160 kcal' },
            ].map(({ emoji, name, type, kcal }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-[26px] w-9 text-center">{emoji}</span>
                <div className="flex-1">
                  <p className="text-[#2C2C2A] text-[14px] font-semibold">{name}</p>
                  <p className="text-[#B4B2A9] text-[12px] font-medium">{type}</p>
                </div>
                <span className="text-[#639922] text-[13px] font-semibold">{kcal}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="w-full bg-[#2D5A27] text-white font-semibold text-[16px] py-4 rounded-2xl tracking-wide">
              Get Started
            </button>
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="w-full bg-white text-[#2D5A27] font-semibold text-[16px] py-4 rounded-2xl border-2 border-[#2D5A27]">
              Log In
            </button>
          </div>

          <p className="text-[#B4B2A9] text-[12px] font-medium text-center tracking-wider">Simple · Affordable · Effective</p>
        </div>
      </div>
    </div>
  )
}