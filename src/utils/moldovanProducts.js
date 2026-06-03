// Moldovan branded products database
// Linked to generic ingredient names used in meal plans
// Prices in MDL — update these after visiting stores

export const moldovanProducts = {
  'cottage': [
    { id: 'cottage_1', brand: 'Grăuncior', productName: 'Brânză de vaci 9%', size: '400g', price: 28, pricePerKg: 70, stores: ['Nr.1', 'Kaufland', 'Linella'], inStock: true },
    { id: 'cottage_2', brand: 'JLC', productName: 'Brânză de vaci 9%', size: '500g', price: 32, pricePerKg: 64, stores: ['Nr.1', 'Linella'], inStock: true },
    { id: 'cottage_3', brand: 'Lactis', productName: 'Brânză de vaci 5%', size: '200g', price: 14, pricePerKg: 70, stores: ['Nr.1', 'Kaufland', 'Green Hills'], inStock: true },
    { id: 'cottage_4', brand: 'Inlac', productName: 'Brânză de vaci 9%', size: '300g', price: 22, pricePerKg: 73, stores: ['Kaufland'], inStock: true },
  ],
  'chicken': [
    { id: 'chicken_1', brand: 'Avicola', productName: 'Piept de pui', size: '1kg', price: 72, pricePerKg: 72, stores: ['Nr.1', 'Kaufland', 'Linella'], inStock: true },
    { id: 'chicken_2', brand: 'Orhei-Vit', productName: 'Piept de pui', size: '1kg', price: 68, pricePerKg: 68, stores: ['Nr.1', 'Kaufland'], inStock: true },
    { id: 'chicken_3', brand: 'Magistral', productName: 'Piept de pui fără os', size: '900g', price: 65, pricePerKg: 72, stores: ['Kaufland', 'Green Hills'], inStock: true },
  ],
  'eggs': [
    { id: 'eggs_1', brand: 'Avicola', productName: 'Ouă albe categoria A', size: '10 buc', price: 32, pricePerKg: null, stores: ['Nr.1', 'Kaufland', 'Linella'], inStock: true },
    { id: 'eggs_2', brand: 'Orhei-Vit', productName: 'Ouă roșii categoria A', size: '10 buc', price: 35, pricePerKg: null, stores: ['Nr.1', 'Kaufland'], inStock: true },
    { id: 'eggs_3', brand: 'Ferma locală', productName: 'Ouă de țară', size: '10 buc', price: 42, pricePerKg: null, stores: ['Piața Centrală', 'Green Hills'], inStock: true },
  ],
  'kefir': [
    { id: 'kefir_1', brand: 'Lactis', productName: 'Chefir 1%', size: '500ml', price: 16, pricePerKg: 32, stores: ['Nr.1', 'Kaufland', 'Linella'], inStock: true },
    { id: 'kefir_2', brand: 'JLC', productName: 'Chefir 2.5%', size: '500ml', price: 18, pricePerKg: 36, stores: ['Nr.1', 'Linella'], inStock: true },
    { id: 'kefir_3', brand: 'Grăuncior', productName: 'Chefir 1.5%', size: '450ml', price: 17, pricePerKg: 38, stores: ['Kaufland', 'Green Hills'], inStock: true },
  ],
  'oats': [
    { id: 'oats_1', brand: 'Dobrogea', productName: 'Fulgi de ovăz', size: '500g', price: 18, pricePerKg: 36, stores: ['Nr.1', 'Kaufland', 'Linella'], inStock: true },
    { id: 'oats_2', brand: 'Malva', productName: 'Fulgi de ovăz instant', size: '400g', price: 15, pricePerKg: 37, stores: ['Nr.1', 'Kaufland'], inStock: true },
    { id: 'oats_3', brand: 'Quaker', productName: 'Ovăz clasic', size: '500g', price: 45, pricePerKg: 90, stores: ['Kaufland', 'Green Hills'], inStock: true },
  ],
  'rice': [
    { id: 'rice_1', brand: 'Dobrogea', productName: 'Orez alb rotund', size: '1kg', price: 22, pricePerKg: 22, stores: ['Nr.1', 'Kaufland', 'Linella'], inStock: true },
    { id: 'rice_2', brand: 'Uncle Bens', productName: 'Orez cu bob lung', size: '500g', price: 28, pricePerKg: 56, stores: ['Kaufland', 'Green Hills'], inStock: true },
    { id: 'rice_3', brand: 'Volare', productName: 'Orez brun', size: '1kg', price: 35, pricePerKg: 35, stores: ['Kaufland'], inStock: true },
  ],
  'buckwheat': [
    { id: 'buckwheat_1', brand: 'Dobrogea', productName: 'Hrișcă', size: '1kg', price: 38, pricePerKg: 38, stores: ['Nr.1', 'Kaufland', 'Linella'], inStock: true },
    { id: 'buckwheat_2', brand: 'Malva', productName: 'Hrișcă prăjită', size: '800g', price: 32, pricePerKg: 40, stores: ['Nr.1', 'Kaufland'], inStock: true },
    { id: 'buckwheat_3', brand: 'Volare', productName: 'Hrișcă verde', size: '500g', price: 28, pricePerKg: 56, stores: ['Green Hills'], inStock: true },
  ],
  'milk': [
    { id: 'milk_1', brand: 'Lactis', productName: 'Lapte 2.5%', size: '1L', price: 22, pricePerKg: 22, stores: ['Nr.1', 'Kaufland', 'Linella'], inStock: true },
    { id: 'milk_2', brand: 'JLC', productName: 'Lapte 3.5%', size: '1L', price: 24, pricePerKg: 24, stores: ['Nr.1', 'Linella'], inStock: true },
    { id: 'milk_3', brand: 'Grăuncior', productName: 'Lapte 1.5%', size: '1L', price: 20, pricePerKg: 20, stores: ['Kaufland', 'Green Hills'], inStock: true },
  ],
  'tuna': [
    { id: 'tuna_1', brand: 'Rio Mare', productName: 'Ton în apă', size: '160g', price: 38, pricePerKg: 237, stores: ['Kaufland', 'Linella', 'Green Hills'], inStock: true },
    { id: 'tuna_2', brand: 'Fitmin', productName: 'Ton în apă', size: '185g', price: 28, pricePerKg: 151, stores: ['Nr.1', 'Kaufland'], inStock: true },
    { id: 'tuna_3', brand: 'Vega', productName: 'Ton în ulei', size: '185g', price: 24, pricePerKg: 130, stores: ['Nr.1'], inStock: true },
  ],
  'potato': [
    { id: 'potato_1', brand: 'Local', productName: 'Cartofi albi', size: '2kg', price: 18, pricePerKg: 9, stores: ['Piața Centrală', 'Nr.1', 'Kaufland'], inStock: true },
    { id: 'potato_2', brand: 'Local', productName: 'Cartofi roșii', size: '2kg', price: 22, pricePerKg: 11, stores: ['Piața Centrală', 'Kaufland'], inStock: true },
  ],
  'banana': [
    { id: 'banana_1', brand: 'Import', productName: 'Banane', size: '1kg', price: 28, pricePerKg: 28, stores: ['Nr.1', 'Kaufland', 'Linella', 'Green Hills'], inStock: true },
  ],
  'tomatoes': [
    { id: 'tomatoes_1', brand: 'Local', productName: 'Roșii proaspete', size: '1kg', price: 22, pricePerKg: 22, stores: ['Piața Centrală', 'Nr.1', 'Kaufland'], inStock: true },
    { id: 'tomatoes_2', brand: 'Bonduelle', productName: 'Roșii în suc propriu', size: '400g', price: 18, pricePerKg: 45, stores: ['Nr.1', 'Kaufland'], inStock: true },
  ],
  'carrots': [
    { id: 'carrots_1', brand: 'Local', productName: 'Morcovi', size: '1kg', price: 12, pricePerKg: 12, stores: ['Piața Centrală', 'Nr.1', 'Kaufland'], inStock: true },
  ],
  'cabbage': [
    { id: 'cabbage_1', brand: 'Local', productName: 'Varză albă', size: '1 bucată ~1.5kg', price: 14, pricePerKg: 9, stores: ['Piața Centrală', 'Nr.1', 'Kaufland'], inStock: true },
  ],
  'beans': [
    { id: 'beans_1', brand: 'Bonduelle', productName: 'Fasole albă în sos', size: '400g', price: 22, pricePerKg: 55, stores: ['Nr.1', 'Kaufland'], inStock: true },
    { id: 'beans_2', brand: 'Local', productName: 'Fasole uscată', size: '1kg', price: 28, pricePerKg: 28, stores: ['Piața Centrală', 'Nr.1'], inStock: true },
  ],
  'bread': [
    { id: 'bread_1', brand: 'Franzeluța', productName: 'Pâine neagră', size: '600g', price: 14, pricePerKg: 23, stores: ['Nr.1', 'Kaufland', 'Linella'], inStock: true },
    { id: 'bread_2', brand: 'Franzeluța', productName: 'Pâine albă', size: '600g', price: 12, pricePerKg: 20, stores: ['Nr.1', 'Kaufland', 'Linella'], inStock: true },
    { id: 'bread_3', brand: 'Barlinek', productName: 'Pâine integrală', size: '500g', price: 22, pricePerKg: 44, stores: ['Kaufland', 'Green Hills'], inStock: true },
  ],
}

export const getProductsForIngredient = (ingredientKey) => {
  return moldovanProducts[ingredientKey] || []
}