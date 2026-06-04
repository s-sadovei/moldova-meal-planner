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
  'chicken breast': '🍗', 'chicken thighs': '🍗', 'minced meat': '🥩',
  'pasta': '🍝', 'pasta sauce': '🍅', 'breadcrumbs': '🍞',
  'greek yogurt': '🥛', 'sour cream': '🥛', 'sweet cheese': '🧀',
  'protein drink': '🥤', 'lentils': '🫘', 'chickpeas': '🫘',
  'fish fillet': '🐟', 'mushrooms': '🍄', 'bell peppers': '🫑',
  'onions': '🧅', 'garlic': '🧄', 'avocado': '🥑',
  'frozen spinach': '🥬', 'frozen broccoli': '🥦', 'frozen peas': '🟢',
  'frozen vegetables mix': '🥦', 'sweet potato': '🍠',
  'apples': '🍎', 'bananas': '🍌', 'pears': '🍐', 'oranges': '🍊',
  'sunflower oil': '🫙', 'olive oil': '🫙',
  'cornmeal': '🌽', 'couscous': '🌾', 'flour': '🌾',
  'canned beans': '🫘', 'canned corn': '🌽', 'canned peas': '🟢',
  'dried beans': '🫘', 'ham': '🥩', 'chicken sausages': '🌭',
  'sea bream': '🐟',
}

export default function MealDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { mealPlan, getBrandPreference, saveBrandPreference } = useApp()
  const [selectedIngredient, setSelectedIngredient] = useState(null)
  const [changingBrand, setChangingBrand] = useState(false)

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

  const getEmoji = (food) => {
    return foodEmojis[food] || foodEmojis[food?.toLowerCase()] || '🥗'
  }

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
            const pref = getBrandPreference(food)
            const products = getProductsForIngredient(food)
            const isEgg = food === 'eggs'
const kcal = pref
  ? isEgg
    ? Math.round(pref.cal * amount * 0.6)
    : Math.round((pref.cal * amount) / 100)
  : 0

            return (
              <div key={i}
                onClick={() => { setSelectedIngredient({ food, amount }); setChangingBrand(false) }}
                className="flex items-center gap-3 bg-white rounded-[14px] border border-[#E8E6E0] px-4 py-3 cursor-pointer">
                <span className="text-[22px] w-8 text-center">{getEmoji(food)}</span>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#2C2C2A] capitalize">{food}</p>
                  {pref ? (
                    <p className="text-[11px] text-[#2D5A27] font-semibold">{pref.brand} · {pref.size}</p>
                  ) : (
                    <p className="text-[12px] text-[#B4B2A9] font-medium">
                      {food === 'eggs' ? `${amount} pcs` : `${amount}g`}
                      {products.length > 0 && <span className="text-[#639922]"> · tap to choose brand</span>}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {pref ? (
                    <>
                      <p className="text-[12px] font-semibold text-[#639922]">{kcal} kcal</p>
                      <p className="text-[11px] text-[#2D5A27] font-semibold">
  {isEgg ? (pref.price * amount).toFixed(2) : (pref.price * amount / 100).toFixed(2)} MDL
</p>
                    </>
                  ) : (
                    <p className="text-[12px] text-[#B4B2A9]">
                      {food === 'eggs' ? `${amount} pcs` : `${amount}g`}
                    </p>
                  )}
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
          onClick={() => { setSelectedIngredient(null); setChangingBrand(false) }}>
          <div
            className="bg-[#F7F5F0] rounded-[28px_28px_0_0] w-full p-6 pb-24 flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
            style={{ maxWidth: '430px', margin: '0 auto' }}
            onClick={e => e.stopPropagation()}>

            <div className="w-9 h-1 bg-[#D3D1C7] rounded-full mx-auto" />

            {(() => {
              const products = getProductsForIngredient(selectedIngredient.food)
              const pref = getBrandPreference(selectedIngredient.food)
              const showBrandList = !pref || changingBrand

              return (
                <>
                  {/* Header — shows selected brand macros or generic name */}
                  <div className="flex items-center gap-3">
                    <span className="text-[36px]">{getEmoji(selectedIngredient.food)}</span>
                    <div>
                      <p style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-[#2C2C2A] text-[22px] font-extrabold capitalize">
                        {pref && !changingBrand ? pref.productName : selectedIngredient.food}
                      </p>
                      <p className="text-[#888780] text-[12px]">
                        {pref && !changingBrand ? `${pref.brand} · Kaufland` : 'Choose your brand'}
                      </p>
                    </div>
                  </div>

                  {/* Macros — from selected brand or empty */}
                  {pref && !changingBrand && (
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { icon: '🔥', val: pref.cal, label: 'kcal per 100g' },
                        { icon: '💪', val: `${pref.p}g`, label: 'protein' },
                        { icon: '🌾', val: `${pref.c}g`, label: 'carbs' },
                        { icon: '🥑', val: `${pref.f}g`, label: 'fat' },
                      ].map(({ icon, val, label }) => (
                        <div key={label} className="bg-white rounded-[14px] border border-[#E8E6E0] p-3 flex flex-col gap-1">
                          <span className="text-[18px]">{icon}</span>
                          <span className="text-[18px] font-bold text-[#2C2C2A]">{val}</span>
                          <span className="text-[11px] text-[#888780]">{label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Price for amount used */}
                  {pref && !changingBrand && (
                    <div className="flex justify-between items-center bg-white rounded-[14px] border border-[#E8E6E0] px-4 py-3">
                      <div>
                        <p style={{ fontFamily: "'Playfair Display', serif" }}
  className="text-[#2D5A27] text-[20px] font-extrabold">
  {selectedIngredient.food === 'eggs'
    ? (pref.price * selectedIngredient.amount).toFixed(2)
    : (pref.price * selectedIngredient.amount / 100).toFixed(2)} MDL
</p>
<p className="text-[#888780] text-[11px]">
  {selectedIngredient.food === 'eggs'
    ? `for ${selectedIngredient.amount} eggs used`
    : `for ${selectedIngredient.amount}g used in this meal`}
</p>
                      </div>
                      <button
                        onClick={() => setChangingBrand(true)}
                        className="bg-[#EAF3DE] text-[#2D5A27] text-[13px] font-semibold px-4 py-2 rounded-[10px]">
                        Change brand
                      </button>
                    </div>
                  )}

                  {/* Brand list */}
                  {showBrandList && (
                    <div className="flex flex-col gap-3">
                      {products.length === 0 ? (
                        <div className="bg-white rounded-[14px] border border-[#E8E6E0] px-4 py-3">
                          <p className="text-[#888780] text-[13px]">No brand data available yet for this ingredient.</p>
                        </div>
                      ) : (
                        products.map(product => (
                          <div key={product.id}
                            onClick={() => { saveBrandPreference(selectedIngredient.food, product); setChangingBrand(false) }}
                            className="bg-white rounded-[16px] border-[1.5px] border-[#E8E6E0] p-4 cursor-pointer active:bg-[#EAF3DE]">
                            <div className="flex justify-between items-start mb-3">
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
  className="text-[#2D5A27] text-[18px] font-extrabold">
  {selectedIngredient.food === 'eggs'
    ? (product.price * selectedIngredient.amount).toFixed(2)
    : (product.price * selectedIngredient.amount / 100).toFixed(2)} MDL
</p>
<p className="text-[#B4B2A9] text-[11px]">
  {selectedIngredient.food === 'eggs'
    ? `for ${selectedIngredient.amount} eggs`
    : `for ${selectedIngredient.amount}g`}
</p>
                              </div>
                            </div>

                            {/* Macros per brand */}
                            <div className="grid grid-cols-4 gap-1.5">
                              {[
                                { label: '🔥 kcal', val: product.cal },
                                { label: '💪 protein', val: `${product.p}g` },
                                { label: '🌾 carbs', val: `${product.c}g` },
                                { label: '🥑 fat', val: `${product.f}g` },
                              ].map(({ label, val }) => (
                                <div key={label} className="bg-[#F7F5F0] rounded-[10px] p-2 flex flex-col items-center gap-0.5">
                                  <span className="text-[12px] font-bold text-[#2C2C2A]">{val}</span>
                                  <span className="text-[9px] text-[#888780] text-center">{label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Used in other meals */}
                  {usedInMeals.length > 0 && !showBrandList && (
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
                </>
              )
            })()}

          </div>
        </div>
      )}

    </div>
  )
}