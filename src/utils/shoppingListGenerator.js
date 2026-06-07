import { moldovanProducts, getAveragePriceForIngredient } from './moldovanProducts'

const ingredientNamesRo = {
  'chicken breast': 'Piept de pui',
  'chicken thighs': 'Pulpe de pui',
  'minced meat': 'Carne tocată',
  'ham': 'Șuncă',
  'chicken sausages': 'Mici de pui',
  'tuna': 'Ton',
  'fish fillet': 'File de pește',
  'sea bream': 'Doradă',
  'eggs': 'Ouă',
  'cottage cheese': 'Brânză de vaci',
  'greek yogurt': 'Iaurt grecesc',
  'kefir': 'Chefir',
  'milk': 'Lapte',
  'sour cream': 'Smântână',
  'sweet cheese': 'Brânzică dulce',
  'protein drink': 'Băutură proteică',
  'oats': 'Fulgi de ovăz',
  'rice': 'Orez',
  'buckwheat': 'Hrișcă',
  'pasta': 'Paste făinoase',
  'bread': 'Pâine',
  'breadcrumbs': 'Pesmeți măcinați',
  'cornmeal': 'Mălai',
  'flour': 'Făină',
  'couscous': 'Couscous',
  'lentils': 'Linte roșie',
  'chickpeas': 'Năut',
  'dried beans': 'Fasole uscată',
  'potatoes': 'Cartofi',
  'sweet potato': 'Cartof batат',
  'cabbage': 'Varză',
  'carrots': 'Morcovi',
  'tomatoes': 'Roșii',
  'cucumbers': 'Castraveți',
  'bell peppers': 'Ardei gras',
  'onions': 'Ceapă',
  'garlic': 'Usturoi',
  'broccoli': 'Broccoli',
  'mushrooms': 'Ciuperci',
  'avocado': 'Avocado',
  'frozen spinach': 'Spanac congelat',
  'frozen broccoli': 'Broccoli congelat',
  'frozen peas': 'Mazăre congelată',
  'frozen vegetables mix': 'Legume congelate mix',
  'apples': 'Mere',
  'bananas': 'Banane',
  'pears': 'Pere',
  'oranges': 'Portocale',
  'canned beans': 'Fasole la conservă',
  'canned corn': 'Porumb la conservă',
  'canned peas': 'Mazăre la conservă',
  'pasta sauce': 'Sos de paste',
  'sunflower oil': 'Ulei de floarea soarelui',
  'olive oil': 'Ulei de măsline',
}

const ingredientCategories = {
  'chicken breast': 'Meat and fish',
  'chicken thighs': 'Meat and fish',
  'minced meat': 'Meat and fish',
  'ham': 'Meat and fish',
  'chicken sausages': 'Meat and fish',
  'tuna': 'Meat and fish',
  'tuna canned': 'Meat and fish',
  'canned tuna': 'Meat and fish',
  'fish fillet': 'Meat and fish',
  'sea bream': 'Meat and fish',
  'salmon': 'Meat and fish',
  'eggs': 'Dairy and eggs',
  'egg': 'Dairy and eggs',
  'cottage cheese': 'Dairy and eggs',
  'greek yogurt': 'Dairy and eggs',
  'greek yoghurt': 'Dairy and eggs',
  'kefir': 'Dairy and eggs',
  'milk': 'Dairy and eggs',
  'sour cream': 'Dairy and eggs',
  'sweet cheese': 'Dairy and eggs',
  'protein drink': 'Dairy and eggs',
  'oats': 'Grains and bread',
  'rice': 'Grains and bread',
  'buckwheat': 'Grains and bread',
  'pasta': 'Grains and bread',
  'bread': 'Grains and bread',
  'breadcrumbs': 'Grains and bread',
  'cornmeal': 'Grains and bread',
  'flour': 'Grains and bread',
  'couscous': 'Grains and bread',
  'lentils': 'Grains and bread',
  'chickpeas': 'Grains and bread',
  'dried beans': 'Grains and bread',
  'potatoes': 'Vegetables',
  'sweet potato': 'Vegetables',
  'cabbage': 'Vegetables',
  'carrots': 'Vegetables',
  'tomatoes': 'Vegetables',
  'tomato': 'Vegetables',
  'cucumbers': 'Vegetables',
  'cucumber': 'Vegetables',
  'bell peppers': 'Vegetables',
  'bell pepper': 'Vegetables',
  'onions': 'Vegetables',
  'onion': 'Vegetables',
  'garlic': 'Vegetables',
  'broccoli': 'Vegetables',
  'mushrooms': 'Vegetables',
  'mushroom': 'Vegetables',
  'avocado': 'Vegetables',
  'frozen spinach': 'Vegetables',
  'frozen broccoli': 'Vegetables',
  'frozen peas': 'Vegetables',
  'frozen vegetables mix': 'Vegetables',
  'spinach': 'Vegetables',
  'apples': 'Fruits',
  'apple': 'Fruits',
  'bananas': 'Fruits',
  'banana': 'Fruits',
  'pears': 'Fruits',
  'pear': 'Fruits',
  'oranges': 'Fruits',
  'orange': 'Fruits',
  'canned beans': 'Canned foods',
  'canned corn': 'Canned foods',
  'canned peas': 'Canned foods',
  'pasta sauce': 'Canned foods',
  'beans': 'Canned foods',
  'sunflower oil': 'Other',
  'olive oil': 'Other',
  'oil': 'Other',
  'vegetable oil': 'Other',
  'honey': 'Other',
  'salt': 'Other',
}

const getCategory = (foodName) => {
  const key = foodName.toLowerCase().trim()
  return ingredientCategories[key] || 'Other'
}

const getUnit = (foodName) => {
  const key = foodName.toLowerCase().trim()
  if (key === 'eggs' || key === 'egg') return 'pcs'
  if (key.includes('oil') || key.includes('milk') || key.includes('kefir')) return 'ml'
  return 'g'
}

export const generateShoppingList = (weekPlan) => {
  const totals = {}

  weekPlan.forEach(day => {
    day.meals.forEach(meal => {
      if (!meal.ingredients) return
      meal.ingredients.forEach(({ food, amount }) => {
        if (!food || food.toLowerCase() === 'water' || food.toLowerCase() === 'salt' || food.toLowerCase() === 'pepper') return
        
        const key = food.toLowerCase().trim()
        if (!totals[key]) {
          totals[key] = {
  name: ingredientNamesRo[key] || food,
  normalizedKey: key,
  amount: 0,
  category: getCategory(key),
  unit: getUnit(key),
}
        }
        totals[key].amount += amount
      })
    })
  })

  return Object.values(totals).map((item, index) => {
    const avgPrice = getAveragePriceForIngredient(item.normalizedKey)
    const estimatedPrice = avgPrice
      ? Math.round(avgPrice * item.amount / 100 * 10) / 10
      : Math.round(item.amount * 0.1)

    return {
  id: index,
  name: item.name,
  ingredientKey: item.normalizedKey,
  category: item.category,
  amount: Math.round(item.amount),
  unit: item.unit,
  estimatedPrice,
  bought: false,
}
  }).sort((a, b) => a.category.localeCompare(b.category))
}