const spoonMl = {
  'sunflower oil': true,
  'olive oil': true,
  'sesame oil': true,
  'soy sauce': true,
  'vinegar': true,
  'balsamic vinegar': true,
}

const spoonG = {
  'honey':       { tsp: 7, tbsp: 21 },
  'tomato paste': { tsp: 6, tbsp: 17 },
  'mustard':     { tsp: 5, tbsp: 15 },
  'pesto':       { tsp: 5, tbsp: 15 },
  'adjika':      { tsp: 5, tbsp: 15 },
  'satsebeli':   { tsp: 6, tbsp: 17 },
  'sweet chili sauce': { tsp: 6, tbsp: 18 },
}

// g = grammatical gender: 'm' = masculine, 'f' = feminine, 'n' = neuter (uses masculine adjective forms)
const wholeItems = {
  'potatoes':       { s: 80,  m: 130, l: 200, name: 'cartof',        plural: 'cartofi',        g: 'm' },
  'sweet potato':   { s: 100, m: 150, l: 220, name: 'cartof dulce',  plural: 'cartofi dulci',  g: 'm' },
  'carrots':        { s: 50,  m: 75,  l: 120, name: 'morcov',        plural: 'morcovi',        g: 'm' },
  'tomatoes':       { s: 80,  m: 130, l: 200, name: 'roșie',         plural: 'roșii',          g: 'f' },
  'apples':         { s: 120, m: 170, l: 220, name: 'măr',           plural: 'mere',           g: 'n' },
  'pears':          { s: 120, m: 170, l: 220, name: 'pară',          plural: 'pere',           g: 'f' },
  'oranges':        { s: 100, m: 150, l: 200, name: 'portocală',     plural: 'portocale',      g: 'f' },
  'bananas':        { s: 80,  m: 100, l: 130, name: 'banană',        plural: 'banane',         g: 'f' },
  'onions':         { s: 50,  m: 80,  l: 120, name: 'ceapă',         plural: 'cepe',           g: 'f' },
  'bell peppers':   { s: 80,  m: 120, l: 170, name: 'ardei',         plural: 'ardei',          g: 'm' },
  'avocado':        { s: 60,  m: 100, l: 150, name: 'avocado',       plural: 'avocado',        g: 'n' },
  'zucchini':       { s: 120, m: 200, l: 280, name: 'dovlecel',      plural: 'dovlecei',       g: 'm' },
  'eggplant':       { s: 150, m: 250, l: 350, name: 'vânătă',        plural: 'vinete',         g: 'f' },
  'cucumbers':      { s: 80,  m: 120, l: 180, name: 'castravete',    plural: 'castraveți',     g: 'm' },
  'kiwi':           { s: 60,  m: 80,  l: 100, name: 'kiwi',          plural: 'kiwi',           g: 'n' },
  'lemon':          { s: 40,  m: 60,  l: 85,  name: 'lămâie',        plural: 'lămâi',          g: 'f' },
  'beetroot':       { s: 80,  m: 130, l: 200, name: 'sfeclă',        plural: 'sfecle',         g: 'f' },
  'cauliflower':    { s: 150, m: 300, l: 500, name: 'conopidă',      plural: 'conopide',       g: 'f' },
}

function formatSpoons(count, unit) {
  if (count <= 0) return null
  const rounded = Math.round(count * 2) / 2
  if (rounded <= 0) return null
  const isHalf = rounded % 1 !== 0
  const whole = Math.floor(rounded)

  if (unit === 'tsp') {
    if (isHalf && whole === 0) return '½ linguriță'
    if (isHalf) return `${whole}½ lingurițe`
    return `${whole} ${whole === 1 ? 'linguriță' : 'lingurițe'}`
  }
  if (isHalf && whole === 0) return '½ lingură'
  if (isHalf) return `${whole}½ linguri`
  return `${whole} ${whole === 1 ? 'lingură' : 'linguri'}`
}

export function formatAmount(food, amount, unit) {
  if (!food || amount == null) return `${amount}g`
  const key = food.toLowerCase()

  if (key === 'eggs') return `${amount} buc`
  if (unit === 'scoops') return `${amount} ${amount === 1 ? 'scoop' : 'scoops'}`

  if (spoonMl[key]) {
    if (amount <= 7) {
      const label = formatSpoons(amount / 5, 'tsp')
      return label ? `${label} (${amount}ml)` : `${amount}ml`
    }
    if (amount <= 50) {
      const label = formatSpoons(amount / 15, 'tbsp')
      return label ? `${label} (${amount}ml)` : `${amount}ml`
    }
    return `${amount}ml`
  }

  const sg = spoonG[key]
  if (sg) {
    if (amount <= sg.tsp * 1.3) {
      const label = formatSpoons(amount / sg.tsp, 'tsp')
      return label ? `${label} (${amount}g)` : `${amount}g`
    }
    if (amount <= sg.tbsp * 3.5) {
      const label = formatSpoons(amount / sg.tbsp, 'tbsp')
      return label ? `${label} (${amount}g)` : `${amount}g`
    }
    return `${amount}g`
  }

  const wi = wholeItems[key]
  if (wi) {
    const small = wi.g === 'f' ? 'mică' : 'mic'
    const medium = wi.g === 'f' ? 'medie' : 'mediu'
    const count = Math.round(amount / wi.m)
    if (count >= 2) return `~${count} ${wi.plural} (${amount}g)`
    if (amount <= wi.s * 1.15) return `1 ${wi.name} ${small} (${amount}g)`
    if (amount <= wi.m * 1.15) return `1 ${wi.name} ${medium} (${amount}g)`
    if (amount <= wi.l * 1.15) return `1 ${wi.name} mare (${amount}g)`
    return `~${count || 1} ${wi.plural} (${amount}g)`
  }

  if (unit === 'ml') return `${amount}ml`
  return `${amount}g`
}

export function formatStep(step, ingredients) {
  if (!step || !ingredients) return step
  let result = step

  ingredients.forEach(({ food, amount, unit }) => {
    const key = food?.toLowerCase()
    if (!key) return

    const isSpoonable = spoonMl[key] || spoonG[key]
    if (!isSpoonable) return

    const suffix = (unit === 'ml' || spoonMl[key]) ? 'ml' : 'g'
    const raw = `${amount}${suffix}`
    if (!result.includes(raw)) return

    const formatted = formatAmount(food, amount, unit)
    if (formatted === raw) return

    result = result.replace(raw, formatted)
  })

  return result
}
