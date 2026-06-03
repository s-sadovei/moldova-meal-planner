import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getProductsForIngredient } from '../utils/moldovanProducts'

const mealEmojis = { breakfast: '🌅', lunch: '🍗', dinner: '🐟', snack: '🥛' }

const foodEmojis = {
  chicken: '🍗', eggs: '🥚', cottage: '🧀', tuna: '🐟',
  rice: '🍚', buckwheat: '🌾', oats: '🥣', potato: '🥔',
  cabbage: '🥬', carrots: '🥕', tomatoes: '🍅', banana: '🍌',
  beans: '🫘', bread: '🍞', milk: '🥛', kefir: '🥛',
}

const foodData = {
  chicken: { cal: 165, p: 31, c: 0, f: 3.6, price: 45 },
  eggs: { cal: 155, p: 13, c: 1.1, f: 11, price: 3 },
  cottage: { cal: 98, p: 11, c: 3.4, f: 4.3, price: 18 },
  tuna: { cal: 116, p: 26, c: 0, f: 1, price: 22 },
  rice: { cal: 130, p: 2.7, c: 28, f: 0.3, price: 8 },
  buckwheat: { cal: 343, p: 13, c: 72, f: 3.4, price: 10 },
  oats: { cal: 389, p: 17, c: 66, f: 7, price: 7 },
  potato: { cal: 77, p: 2, c: 17, f: 0.1, price: 4 },
  cabbage: { cal: 25, p: 1.3, c: 6, f: 0.1, price: 3 },
  carrots: { cal: 41, p: 0.9, c: 10, f: 0.2, price: 3 },
  tomatoes: { cal: 18, p: 0.9, c: 3.9, f: 0.2, price: 5 },
  banana: { cal: 89, p: 1.1, c: 23, f: 0.3, price: 6 },
  beans: { cal: 347, p: 21, c: 63, f: 1.2, price: 9 },
  bread: { cal: 265, p: 9, c: 49, f: 3.2, price: 5 },
  milk: { cal: 42, p: 3.4, c: 5, f: 1, price: 12 },
  kefir: { cal: 40, p: 3.3, c: 4.7, f: 1, price: 14 },
}

export default function MealDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { mealPlan, getBrandPreference, saveBrandPreference } = useApp()
  const [selectedIngredient, setSelectedIngredient] = useState(null)

  const meal = location.state?.meal
  if (!meal) { navigate(-1); return null }

  const usedInMeals = mealPlan?.weekPlan.flatMap(d => d.meals)
    .filter(m => m.name !== meal.name && m.ingredients?.some(i => i.food === selectedIngredient?.food))
    .map(m => m.name)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 3) || []

  const steps = meal.steps?.length > 0
  ? meal.steps
  : ['Prepare all ingredients and combine. Season to taste and serve fresh.']

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">

      {/* Header */}
      <div className="bg-[#2D5A27] px-6 pt-12 pb-6 flex flex-col gap-3">
        <button onClick={() => navigate(-1)}
          className="self-start text-[#9FE1CB] text-[13px] font-medium mb-2">
          ← Back
        </button>
        <p className="text-[#C0DD97] text-[11px] font-semibold uppercase tracking-widest">
          {mealEmojis[meal.type]} {meal.type}
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-white text-[32px] font-extrabold leading-tight">
          {meal.name}
        </h1>
        <div className="flex gap-2 mt-1">
          {[
            { val: meal.cal, label: 'kcal' },
            { val: `${meal.p}g`, label: 'protein' },
            { val: `${meal.c}g`, label: 'carbs' },
            { val: `${meal.f}g`, label: 'fat' },
          ].map(({ val, label }) => (
            <div key={label} className="flex-1 bg-white/10 rounded-full py-2 flex flex-col items-center gap-0.5">
              <span className="text-white text-[14px] font-bold">{val}</span>
              <span className="text-[#9FE1CB] text-[10px]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wave */}
      <div className="bg-[#2D5A27] h-7" style={{ clipPath: 'ellipse(110% 100% at 50% 0%)' }} />

      {/* Body */}
      <div className="flex-1 px-5 pb-10 flex flex-col gap-5 overflow-y-auto">

        {/* Ingredients */}
        <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Ingredients</p>
        <div className="flex flex-col gap-2 -mt-2">
          {meal.ingredients?.map(({ food, amount }, i) => {
            const fd = foodData[food]
            const kcal = fd ? (food === 'eggs' ? Math.round(fd.cal * amount * 0.78) : Math.round((fd.cal * amount) / 100)) : 0
            const pref = getBrandPreference(food)
            return (
              <div key={i}
                onClick={() => setSelectedIngredient({ food, amount, fd })}
                className="flex items-center gap-3 bg-white rounded-[14px] border border-[#E8E6E0] px-4 py-3 cursor-pointer">
                <span className="text-[22px] w-8 text-center">{foodEmojis[food] || '🥗'}</span>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#2C2C2A] capitalize">{food}</p>
                  {pref ? (
                    <p className="text-[11px] text-[#2D5A27] font-semibold">{pref.brand} · {pref.size}</p>
                  ) : (
                    <p className="text-[12px] text-[#B4B2A9] font-medium">
  {food === 'eggs' ? `${amount} pcs` : `${amount}g`}
</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-semibold text-[#639922]">{kcal} kcal</p>
                  {pref && <p className="text-[11px] text-[#2D5A27] font-semibold">{pref.price} MDL</p>}
                </div>
                <span className="text-[#D3D1C7] text-[16px]">›</span>
              </div>
            )
          })}
        </div>

        {/* Steps */}
        <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">How to cook</p>
        <div className="flex flex-col gap-3 -mt-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-[#2D5A27] text-white text-[13px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-[14px] text-[#2C2C2A] leading-relaxed font-medium flex-1">{step}</p>
            </div>
          ))}
        </div>

        {/* Cost + Replace */}
        <div className="flex justify-between items-center bg-white rounded-[16px] border border-[#E8E6E0] px-4 py-4">
          <div>
            <p style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-[#2D5A27] text-[22px] font-extrabold">{meal.cost} MDL</p>
            <p className="text-[#888780] text-[12px]">estimated cost</p>
          </div>
          <button className="bg-[#F7F5F0] border-[1.5px] border-[#E8E6E0] text-[#5F5E5A] text-[13px] font-semibold px-4 py-2.5 rounded-[12px]">
            🔄 Replace meal
          </button>
        </div>

      </div>

      {/* Ingredient Modal */}
      {selectedIngredient && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50"
          onClick={() => setSelectedIngredient(null)}>
          <div
            className="bg-[#F7F5F0] rounded-[28px_28px_0_0] w-full p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto"
            style={{ maxWidth: '430px', margin: '0 auto' }}
            onClick={e => e.stopPropagation()}>

            <div className="w-9 h-1 bg-[#D3D1C7] rounded-full mx-auto" />

            {/* Header */}
            <div className="flex items-center gap-3">
              <span className="text-[36px]">{foodEmojis[selectedIngredient.food] || '🥗'}</span>
              <div>
                <p style={{ fontFamily: "'Playfair Display', serif" }}
                  className="text-[#2C2C2A] text-[22px] font-extrabold capitalize">
                  {selectedIngredient.food}
                </p>
                <p className="text-[#888780] text-[12px]">Per 100g · Common in Moldova</p>
              </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: '🔥', val: selectedIngredient.fd?.cal || 0, label: 'kcal per 100g' },
                { icon: '💪', val: `${selectedIngredient.fd?.p || 0}g`, label: 'protein' },
                { icon: '🌾', val: `${selectedIngredient.fd?.c || 0}g`, label: 'carbs' },
                { icon: '🥑', val: `${selectedIngredient.fd?.f || 0}g`, label: 'fat' },
              ].map(({ icon, val, label }) => (
                <div key={label} className="bg-white rounded-[14px] border border-[#E8E6E0] p-3 flex flex-col gap-1">
                  <span className="text-[18px]">{icon}</span>
                  <span className="text-[18px] font-bold text-[#2C2C2A]">{val}</span>
                  <span className="text-[11px] text-[#888780]">{label}</span>
                </div>
              ))}
            </div>

            {/* Brand section */}
            {(() => {
              const products = getProductsForIngredient(selectedIngredient.food)
              const pref = getBrandPreference(selectedIngredient.food)

              if (products.length === 0) return (
                <div className="bg-white rounded-[14px] border border-[#E8E6E0] px-4 py-3">
                  <p style={{ fontFamily: "'Playfair Display', serif" }}
                    className="text-[#2D5A27] text-[20px] font-extrabold">
                    {selectedIngredient.fd?.price || '—'} MDL
                  </p>
                  <p className="text-[#888780] text-[11px]">estimated price per 100g</p>
                </div>
              )

              if (pref) return (
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Your preferred brand</p>
                  <div className="bg-[#EAF3DE] rounded-[16px] border-[1.5px] border-[#C0DD97] p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[15px] font-bold text-[#2D5A27]">{pref.brand}</p>
                        <p className="text-[13px] text-[#639922] mt-0.5">{pref.productName} · {pref.size}</p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {pref.stores.map(store => (
                            <span key={store} className="bg-white text-[#5F5E5A] text-[11px] font-medium px-2 py-1 rounded-full">
                              📍 {store}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <p style={{ fontFamily: "'Playfair Display', serif" }}
                          className="text-[#2D5A27] text-[20px] font-extrabold">{pref.price} MDL</p>
                        <p className="text-[#B4B2A9] text-[11px]">{pref.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => saveBrandPreference(selectedIngredient.food, null)}
                      className="mt-3 text-[12px] text-[#888780] font-medium">
                      Change brand →
                    </button>
                  </div>
                </div>
              )

              return (
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Choose your brand</p>
                  {products.map(product => (
                    <div key={product.id}
                      onClick={() => saveBrandPreference(selectedIngredient.food, product)}
                      className="bg-white rounded-[16px] border-[1.5px] border-[#E8E6E0] p-4 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[15px] font-bold text-[#2C2C2A]">{product.brand}</p>
                          <p className="text-[13px] text-[#888780] mt-0.5">{product.productName} · {product.size}</p>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {product.stores.map(store => (
                              <span key={store} className="bg-[#F7F5F0] text-[#5F5E5A] text-[11px] font-medium px-2 py-1 rounded-full">
                                📍 {store}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <p style={{ fontFamily: "'Playfair Display', serif" }}
                            className="text-[#2D5A27] text-[20px] font-extrabold">{product.price} MDL</p>
                          <p className="text-[#B4B2A9] text-[11px]">{product.size}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* Used in other meals */}
            {usedInMeals.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Also used in</p>
                <div className="flex flex-wrap gap-2">
                  {usedInMeals.map(name => (
                    <span key={name} className="bg-[#EAF3DE] text-[#2D5A27] text-[12px] font-semibold px-3 py-1.5 rounded-full">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}