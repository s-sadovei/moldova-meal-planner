import { ingredientNamesRo } from './shoppingListGenerator'

export const allergyGroups = [
  {
    id: 'nuts',
    label: 'Nuci',
    icon: '🥜',
    keys: ['almonds', 'cashews', 'peanuts'],
  },
  {
    id: 'dairy',
    label: 'Lactate',
    icon: '🥛',
    keys: ['milk', 'cottage cheese', 'cottage cheese 0', 'cottage cheese 9', 'greek yogurt', 'kefir', 'sour cream', 'cream cheese', 'mozzarella', 'parmesan', 'feta', 'butter', 'heavy cream', 'sweet cheese', 'condensed milk', 'protein drink'],
  },
  {
    id: 'eggs',
    label: 'Ouă',
    icon: '🥚',
    keys: ['eggs'],
  },
  {
    id: 'gluten',
    label: 'Gluten',
    icon: '🌾',
    keys: ['bread', 'pasta', 'flour', 'breadcrumbs', 'couscous', 'bulgur', 'lavash', 'filo pastry', 'oats'],
  },
  {
    id: 'fish',
    label: 'Pește',
    icon: '🐟',
    keys: ['fish fillet', 'salmon', 'smoked salmon', 'tuna', 'sea bream'],
  },
  {
    id: 'shellfish',
    label: 'Crustacee',
    icon: '🦐',
    keys: ['shrimp'],
  },
  {
    id: 'pork',
    label: 'Porc',
    icon: '🥩',
    keys: ['minced meat', 'ham'],
  },
  {
    id: 'soy',
    label: 'Soia',
    icon: '🫘',
    keys: ['soy sauce'],
  },
]

const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ț/g, 't').replace(/ș/g, 's').replace(/Ț/g, 'T').replace(/Ș/g, 'S')

const allProducts = Object.entries(ingredientNamesRo).map(([key, name]) => ({
  key,
  name,
  nameLower: name.toLowerCase(),
  nameNorm: strip(name.toLowerCase()),
  keyLower: key.toLowerCase(),
}))

export const fuzzyMatchProduct = (input) => {
  if (!input || input.trim().length < 2) return []
  const q = strip(input.toLowerCase().trim())

  const scored = allProducts.map(p => {
    let score = 0
    if (p.keyLower === q || p.nameNorm === q) score = 100
    else if (p.keyLower.startsWith(q) || p.nameNorm.startsWith(q)) score = 80
    else if (p.keyLower.includes(q) || p.nameNorm.includes(q)) score = 60
    else {
      const dist = levenshtein(q, p.nameNorm.slice(0, q.length + 2))
      const distKey = levenshtein(q, p.keyLower.slice(0, q.length + 2))
      const best = Math.min(dist, distKey)
      if (best <= Math.max(1, Math.floor(q.length / 3))) score = 40 - best
    }
    return { ...p, score }
  }).filter(p => p.score > 0)

  return scored.sort((a, b) => b.score - a.score).slice(0, 5)
}

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const d = Array.from({ length: m + 1 }, (_, i) => [i])
  for (let j = 1; j <= n; j++) d[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      d[i][j] = a[i - 1] === b[j - 1]
        ? d[i - 1][j - 1]
        : 1 + Math.min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1])
    }
  }
  return d[m][n]
}

export const getBlockedKeys = (selectedAllergies = [], customExclusions = []) => {
  const blocked = new Set()
  selectedAllergies.forEach(allergyId => {
    const group = allergyGroups.find(g => g.id === allergyId)
    if (group) group.keys.forEach(k => blocked.add(k))
  })
  customExclusions.forEach(key => blocked.add(key))
  return [...blocked]
}
