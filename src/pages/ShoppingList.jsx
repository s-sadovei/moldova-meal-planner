import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { getProductsForIngredient, getAveragePriceForIngredient } from '../utils/moldovanProducts'

const categoryEmojis = {
  'Meat and fish': '🥩',
  'Dairy and eggs': '🥛',
  'Grains and bread': '🌾',
  'Vegetables': '🥦',
  'Fruits': '🍎',
  'Canned foods': '🥫',
  'Other': '🛍️',
}

export default function ShoppingList() {
  const { mealPlan, toggleShoppingItem, markAtHome, brandPreferences, saveBrandPreference, getBrandPreference, profile } = useApp()
  const [selectedItem, setSelectedItem] = useState(null)

  if (!mealPlan) return null

  const all = mealPlan.shoppingList
  const unchecked = all.filter(i => !i.bought && !i.atHome)
  const checked = all.filter(i => i.bought)
  const total = all.length

  const getEffectivePrice = (item) => {
  const pref = getBrandPreference(item.name)
  const amount = item.amount || 100
  if (pref) {
    return Math.round(pref.price * amount / 100 * 10) / 10
  }
  const avgPrice = getAveragePriceForIngredient(item.name.toLowerCase())
  if (avgPrice) {
    return Math.round(avgPrice * amount / 100 * 10) / 10
  }
  return item.estimatedPrice
}

  const atHome = all.filter(i => i.atHome)
  const spentSoFar = checked.reduce((sum, i) => sum + getEffectivePrice(i), 0)
  const totalCost = all.filter(i => !i.atHome).reduce((sum, i) => sum + getEffectivePrice(i), 0)
  const remaining = totalCost - spentSoFar
  const progressPct = Math.round((checked.length / total) * 100)
  const budgetBarPct = Math.min(100, (spentSoFar / totalCost) * 100)

  const uncheckedCategories = [...new Set(unchecked.map(i => i.category))]
  const checkedCategories = [...new Set(checked.map(i => i.category))]

  const handleSelectBrand = (item, product) => {
  saveBrandPreference(item.name, product)
  setSelectedItem(null)
}

  const ItemCard = ({ item }) => {
    const products = getProductsForIngredient(item.name.toLowerCase())
    const pref = getBrandPreference(item.name)
    const hasProducts = products.length > 0

    return (
      <div className={`bg-white rounded-[16px] border border-[#E8E6E0] px-4 py-3 flex items-center gap-3 transition ${item.bought || item.atHome ? 'opacity-40' : ''}`}>
        <div
          onClick={e => { e.stopPropagation(); toggleShoppingItem(item.id) }}
          className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all duration-200 cursor-pointer ${item.bought ? 'bg-[#C0DD97] border-[#C0DD97]' : 'border-[#E8E6E0]'}`}>
          {item.bought && <span className="text-[#2D5A27] text-[13px] font-bold">✓</span>}
        </div>
        <div className="flex-1 cursor-pointer" onClick={() => hasProducts ? setSelectedItem(item) : null}>
          <p className={`text-[14px] font-semibold transition-all duration-200 ${item.bought || item.atHome ? 'line-through text-[#B4B2A9]' : 'text-[#2C2C2A]'}`}>
            {item.name}
          </p>
          {item.atHome && (
            <p className="text-[11px] text-[#639922] font-semibold mt-0.5">🏠 Already at home</p>
          )}
          {!item.atHome && pref ? (
            <p className="text-[11px] text-[#2D5A27] font-semibold mt-0.5">{pref.brand} · {pref.productName}</p>
          ) : !item.atHome && (
            <p className="text-[#B4B2A9] text-[12px] font-medium mt-0.5">{item.amount} {item.unit}</p>
          )}
          {hasProducts && !pref && !item.atHome && (
            <p className="text-[11px] text-[#639922] font-semibold mt-0.5">Tap to choose brand →</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!item.bought && (
            <button
              onClick={e => { e.stopPropagation(); markAtHome(item.id) }}
              className={`text-[11px] font-semibold px-2 py-1 rounded-[8px] transition ${item.atHome ? 'bg-[#EAF3DE] text-[#2D5A27]' : 'bg-[#F7F5F0] text-[#888780]'}`}>
              🏠
            </button>
          )}
          {!item.atHome && (
            <span className="text-[#639922] text-[13px] font-semibold">
              {getEffectivePrice(item)} MDL
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">

      {/* Header */}
      <div className="bg-[#2D5A27] px-6 pt-12 pb-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-white text-[30px] font-extrabold leading-tight">
              Shopping<br />List.
            </h1>
            <p className="text-[#9FE1CB] text-[13px] font-medium mt-1">Week plan ingredients</p>
          </div>
          <span className="bg-[#C0DD97] text-[#2D5A27] text-[13px] font-bold px-4 py-1.5 rounded-full">
            {checked.length} / {total} done
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[12px] text-[#9FE1CB]">
            <span>Items checked off</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full h-[6px] bg-white/15 rounded-full overflow-hidden">
            <div className="h-full bg-[#C0DD97] rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Wave */}
      <div className="bg-[#2D5A27] h-7" style={{ clipPath: 'ellipse(110% 100% at 50% 0%)' }} />

      {/* Body */}
      <div className="flex-1 px-5 pb-28 flex flex-col gap-5 overflow-y-auto">

        {/* Budget summary */}
{(() => {
  const weeklyBudget = profile?.budget || 0
  const budgetSpentPct = weeklyBudget ? Math.min(100, (spentSoFar / weeklyBudget) * 100) : 0
  const budgetEstimatePct = weeklyBudget ? Math.min(100, (totalCost / weeklyBudget) * 100) : 0
  const isOverBudget = spentSoFar > weeklyBudget
  const isEstimateOver = totalCost > weeklyBudget
  const budgetRemaining = weeklyBudget - spentSoFar

  return (
    <div className="bg-white rounded-[20px] border border-[#E8E6E0] p-4 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div>
          <p style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-[24px] font-extrabold leading-tight"
            style={{ color: isOverBudget ? '#E24B4A' : '#2D5A27' }}>
            {spentSoFar.toFixed(2)} MDL
          </p>
          <p className="text-[#888780] text-[11px] font-medium mt-0.5">spent so far</p>
        </div>
        <div className="text-right">
          <p className="text-[#5F5E5A] text-[16px] font-bold">{weeklyBudget} MDL</p>
          <p className="text-[#B4B2A9] text-[11px]">weekly budget</p>
        </div>
      </div>

      {/* Budget progress bar */}
      <div className="flex flex-col gap-1">
        <div className="w-full h-[8px] bg-[#F0EEE8] rounded-full overflow-hidden relative">
          {/* Estimate bar (lighter) */}
          <div className="absolute h-full rounded-full transition-all duration-300"
            style={{ width: `${budgetEstimatePct}%`, backgroundColor: isEstimateOver ? '#fca5a5' : '#E8F5D0' }} />
          {/* Spent bar (darker) */}
          <div className="absolute h-full rounded-full transition-all duration-300"
            style={{ width: `${budgetSpentPct}%`, backgroundColor: isOverBudget ? '#E24B4A' : '#2D5A27' }} />
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-[#B4B2A9]">Estimate: {totalCost.toFixed(2)} MDL</span>
          <span className="text-[#B4B2A9]">Budget: {weeklyBudget} MDL</span>
        </div>
      </div>

      {isOverBudget ? (
        <p className="text-[#E24B4A] text-[12px] font-semibold">
          ⚠️ {Math.abs(budgetRemaining).toFixed(2)} MDL over budget!
        </p>
      ) : isEstimateOver ? (
        <p className="text-[#E24B4A] text-[12px] font-semibold">
          ⚠️ Estimated total exceeds your budget by {(totalCost - weeklyBudget).toFixed(2)} MDL
        </p>
      ) : (
        <p className="text-[#639922] text-[12px] font-semibold">
          ✓ {budgetRemaining.toFixed(2)} MDL remaining in your budget
        </p>
      )}
    </div>
  )
})()}

        {/* Unchecked items */}
        {uncheckedCategories.map(category => (
          <div key={category} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest whitespace-nowrap">
                {categoryEmojis[category] || '🛍️'} {category}
              </p>
              <div className="flex-1 h-px bg-[#E8E6E0]" />
            </div>
            {unchecked.filter(i => i.category === category).map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ))}
        {/* At home items */}
{atHome.length > 0 && (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <p className="text-[11px] font-semibold text-[#B4B2A9] uppercase tracking-widest whitespace-nowrap">🏠 At home</p>
      <div className="flex-1 h-px bg-[#E8E6E0]" />
      <span className="text-[11px] text-[#B4B2A9] font-medium">{atHome.length} items</span>
    </div>
    {atHome.map(item => (
      <ItemCard key={item.id} item={item} />
    ))}
  </div>
)}


        {/* Checked items */}
        {checked.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold text-[#B4B2A9] uppercase tracking-widest whitespace-nowrap">✓ Bought</p>
              <div className="flex-1 h-px bg-[#E8E6E0]" />
              <span className="text-[11px] text-[#B4B2A9] font-medium">{checked.length} items</span>
            </div>
            {checkedCategories.map(category =>
              checked.filter(i => i.category === category).map(item => (
                <ItemCard key={item.id} item={item} />
              ))
            )}
          </div>
        )}

      </div>

      {/* Brand picker modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50"
          onClick={() => setSelectedItem(null)}>
          <div className="bg-[#F7F5F0] rounded-[28px_28px_0_0] w-full p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
            style={{ maxWidth: '430px', margin: '0 auto' }}
            onClick={e => e.stopPropagation()}>

            <div className="w-9 h-1 bg-[#D3D1C7] rounded-full mx-auto" />

            <div>
              <p className="text-[11px] font-semibold text-[#888780] uppercase tracking-widest">Choose your brand</p>
              <p style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-[#2C2C2A] text-[22px] font-extrabold mt-1">{selectedItem.name}</p>
              <p className="text-[#888780] text-[13px]">Select the product you usually buy</p>
            </div>

            <div className="flex flex-col gap-3">
              {getProductsForIngredient(selectedItem.name.toLowerCase()).map(product => (
                <div key={product.id}
                  onClick={() => handleSelectBrand(selectedItem, product)}
                  className={`bg-white rounded-[16px] border-[1.5px] p-4 cursor-pointer transition ${getBrandPreference(selectedItem.name)?.id === product.id ? 'border-[#C0DD97] bg-[#EAF3DE]' : 'border-[#E8E6E0]'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[15px] font-bold text-[#2C2C2A]">{product.brand}</p>
                      <p className="text-[13px] text-[#888780] mt-0.5">{product.productName} · {product.size}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {product.stores.map(store => (
                          <span key={store} className="bg-[#F7F5F0] text-[#5F5E5A] text-[11px] font-medium px-2 py-1 rounded-full">
                            📍 {store}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p style={{ fontFamily: "'Playfair Display', serif" }}
  className="text-[#2D5A27] text-[20px] font-extrabold">
  {Math.round(product.price * (selectedItem?.amount || 100) / 100 * 10) / 10} MDL
</p>
<p className="text-[#B4B2A9] text-[11px]">for {selectedItem?.amount}{selectedItem?.unit} · {product.price} MDL/100g</p>
                      {product.pricePerKg && (
                        <p className="text-[#B4B2A9] text-[11px]">{product.pricePerKg} MDL/kg</p>
                      )}
                    </div>
                  </div>
                  {getBrandPreference(selectedItem.name)?.id === product.id && (
                    <p className="text-[#2D5A27] text-[12px] font-semibold mt-2">✓ Your preferred brand</p>
                  )}
                </div>
              ))}

              <div
                onClick={() => setSelectedItem(null)}
                className="bg-white rounded-[16px] border-[1.5px] border-[#E8E6E0] p-4 cursor-pointer text-center">
                <p className="text-[14px] font-semibold text-[#888780]">Use estimated price instead</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}