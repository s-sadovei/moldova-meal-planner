const shelfLife = {
  'rice': { days: 2, name: 'orezul', verb: 'Fierbe' },
  'buckwheat': { days: 2, name: 'hrișca', verb: 'Fierbe' },
  'pasta': { days: 3, name: 'pastele', verb: 'Fierbe' },
  'lentils': { days: 3, name: 'lintea', verb: 'Fierbe' },
  'chickpeas': { days: 3, name: 'năutul', verb: 'Fierbe' },
  'canned beans': { days: 3, name: 'fasolea', verb: 'Încălzește' },
  'dried beans': { days: 3, name: 'fasolea', verb: 'Fierbe' },
  'couscous': { days: 2, name: 'cușcușul', verb: 'Fierbe' },
}

const dayNames = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică']

export function getPrepTips(weekPlan, currentDayIndex, currentMeal, batchCooked = {}) {
  if (!weekPlan || !currentMeal?.ingredients) return []

  const tips = []

  currentMeal.ingredients.forEach(({ food, amount }) => {
    const key = food?.toLowerCase() || food
    const shelf = shelfLife[key]
    if (!shelf) return

    const otherUses = []
    weekPlan.forEach((day, dayIdx) => {
      if (dayIdx === currentDayIndex) return
      day.meals.forEach(m => {
        if (m.name === currentMeal.name && dayIdx === currentDayIndex) return
        const match = m.ingredients?.find(i => (i.key || i.food) === key)
        if (match) {
          otherUses.push({
            dayIndex: dayIdx,
            dayName: dayNames[dayIdx],
            mealName: m.name,
            amount: match.amount,
          })
        }
      })
    })

    if (otherUses.length === 0) return

    const pastBatch = otherUses
      .filter(u => u.dayIndex < currentDayIndex && (currentDayIndex - u.dayIndex) <= shelf.days)
      .sort((a, b) => b.dayIndex - a.dayIndex)
      .find(u => batchCooked[key]?.dayIndex === u.dayIndex)

    if (pastBatch) {
      const unit = key === 'eggs' ? 'buc' : 'g'
      tips.push({
        type: 'reuse',
        ingredientKey: key,
        label: shelf.name,
        amount,
        unit,
        fromDay: pastBatch.dayName,
        shelfDays: shelf.days,
        message: `Folosește ${amount}${unit} din ${shelf.name} gătit ${pastBatch.dayName}.`,
      })
      return
    }

    const futureUses = otherUses.filter(u => u.dayIndex > currentDayIndex)

    const reachableUses = futureUses.filter(u =>
      (u.dayIndex - currentDayIndex) <= shelf.days
    )

    if (reachableUses.length > 0) {
      const totalExtra = reachableUses.reduce((s, u) => s + u.amount, 0)
      const totalAll = totalExtra + amount
      const daysText = reachableUses.map(u => u.dayName).join(', ')
      const unit = key === 'eggs' ? 'buc' : 'g'

      tips.push({
        type: 'batch',
        ingredientKey: key,
        label: shelf.name,
        totalAmount: totalAll,
        extraAmount: totalExtra,
        unit,
        verb: shelf.verb,
        futureDays: daysText,
        futureUses: reachableUses,
        shelfDays: shelf.days,
        message: `${shelf.verb} ${totalAll}${unit} ${shelf.name} acum — ajunge și pentru ${daysText}. Se păstrează ${shelf.days} zile la frigider.`,
      })
    }
  })

  return tips
}
