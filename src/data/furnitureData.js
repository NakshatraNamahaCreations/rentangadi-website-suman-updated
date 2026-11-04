/**
 * Furniture gallery data - loads images via Vite's import.meta.glob
 * Categorizes by filename: chair=Chairs, table=Tables, sofa=Sofas, bouquet/floral=Decor
 */

const furniture1Modules = import.meta.glob('../assets/furniture1/*.{jpeg,jpg,png,webp,avif}', { eager: true })
const images1Modules = import.meta.glob('../assets/images1/*.{jpeg,jpg,png,webp,avif}', { eager: true })
const iamges2Modules = import.meta.glob('../assets/iamges2/*.{jpeg,jpg,png,webp,avif}', { eager: true })
const modules = { ...furniture1Modules, ...images1Modules, ...iamges2Modules }

const CATEGORY_PREFIX = { Chairs: 'CH', Tables: 'TB', Sofas: 'SF', Decor: 'DC', All: 'OT' }
const CATEGORY_COUNTS = {}

function getCategory(filename) {
  const base = filename.toLowerCase()
  if (base.includes('chair')) return 'Chairs'
  if (base.includes('sofa')) return 'Sofas'
  if (base.includes('table')) return 'Tables'
  if (base.includes('bouquet') || base.includes('bridal') || base.includes('floral') || base.includes('decor')) return 'Decor'
  if (base.includes('dish') || base.includes('arrangement')) return 'Tables'
  return 'All'
}

const GENERAL_NAMES = {
  Chairs: [
    'Elegant Chiavari Chair', 'White Wedding Chair', 'Classic Dining Chair', 'Gilded Wooden Chair',
    'Brown Chiavari Chair', 'Bouquet Chair', 'Outdoor Ceremony Chair', 'Premium Event Chair',
    'Rustic Wood Chair', 'Upholstered Banquet Chair', 'Garden Wedding Chair', 'Vintage Style Chair',
  ],
  Tables: [
    'Oak Carved Console Table', 'Wedding Reception Table', 'Elegant Dining Table', 'Round Center Table',
    'Celebration Table Setup', 'Wedding Table Arrangement', 'Elegant Wedding Dishes', 'Floral Table Setting',
    'Console Table', 'Dining Set Table', 'Cocktail Table', 'Banquet Table',
  ],
  Sofas: [
    'Luxury Sofa Set', 'White Velvet Sofa', '3-Seater Sofa', 'Elegant Lounge Sofa',
    'Wedding Reception Sofa', 'Classic Sofa Set', 'Premium Event Sofa', 'Comfort Sofa',
  ],
  Decor: [
    'Floral Centerpiece', 'Wedding Arch Decoration', 'Bridal Bouquet Display', 'Elegant Table Arrangement',
    'Floral Garland Arch', 'Wedding Venue Decor', 'Open Air Terrace Setup', 'Floral Arch Structure',
    'Bouquet Stand', 'Ceremony Arch', 'Garden Decor', 'Romantic Floral Display',
  ],
  All: ['Premium Furniture Piece', 'Elegant Rental Item', 'Wedding Collection Item', 'Event Furniture'],
}

// Map sofa display name -> sub-category key for Lounge, Classic, Event, Velvet
const SOFA_SUBCATEGORY_MAP = {
  'Luxury Sofa Set': 'lounge',
  'White Velvet Sofa': 'velvet',
  '3-Seater Sofa': 'lounge',
  'Elegant Lounge Sofa': 'lounge',
  'Wedding Reception Sofa': 'event',
  'Classic Sofa Set': 'classic',
  'Premium Event Sofa': 'event',
  'Comfort Sofa': 'lounge',
}

const DESCRIPTIONS = {
  Chairs: [
    'Elegant chiavari chairs perfect for wedding ceremonies and receptions. Premium quality with comfortable seating.',
    'Classic white wedding chairs ideal for outdoor and indoor events. Durable and stylish.',
    'Traditional dining chairs with timeless design. Suitable for banquets and formal gatherings.',
    'Gilded wooden chairs adding a touch of luxury to your special day. Handcrafted details.',
    'Brown chiavari chairs with floral accents. Versatile for garden and ballroom weddings.',
    'Chairs adorned with delicate bouquet arrangements. Perfect for bridal party seating.',
    'Outdoor ceremony chairs designed for comfort and elegance. Weather-resistant finish.',
    'Premium event chairs with upholstered seats. Ideal for extended celebrations.',
    'Rustic wood chairs for barn and garden weddings. Natural, earthy aesthetic.',
    'Upholstered banquet chairs in neutral tones. Comfortable for long receptions.',
    'Garden wedding chairs with classic design. Complements outdoor venues beautifully.',
    'Vintage-style chairs with ornate details. Perfect for traditional wedding themes.',
  ],
  Tables: [
    'Oak carved console table with intricate leg details. Ideal for reception displays and decor.',
    'Wedding reception table setup with elegant styling. Accommodates place settings and centerpieces.',
    'Elegant dining table for intimate gatherings. Premium wood finish.',
    'Round center table perfect for cocktail hours. Versatile and space-efficient.',
    'Celebration table setup with floral arrangements. Ready for your wedding feast.',
    'Wedding table arrangement with sophisticated styling. Includes linen and decor options.',
    'Elegant wedding dishes and tableware. Complete setup for dining.',
    'Floral table setting with coordinated centerpieces. Creates a cohesive look.',
    'Console table for entryways and gift displays. Classic design.',
    'Dining set table with matching chairs. Complete package for smaller events.',
    'Cocktail table for lounge areas. Modern and functional.',
    'Banquet table for large receptions. Sturdy and reliable.',
  ],
  Sofas: [
    'Luxury sofa set for lounge areas and photo backdrops. Plush seating for guests.',
    'White velvet sofa adding elegance to your venue. Perfect for couple portraits.',
    '3-seater sofa for reception lounges. Comfortable and stylish.',
    'Elegant lounge sofa for guest seating areas. Premium upholstery.',
    'Wedding reception sofa set. Creates a cozy atmosphere.',
    'Classic sofa set with timeless design. Complements various themes.',
    'Premium event sofa for VIP seating. Luxurious comfort.',
    'Comfort sofa for relaxation areas. Durable and inviting.',
  ],
  Decor: [
    'Floral centerpiece featuring seasonal blooms. Adds color and fragrance to your tables.',
    'Wedding arch decoration with lush greenery and flowers. Stunning ceremony backdrop.',
    'Bridal bouquet display stand. Showcase your bouquet beautifully.',
    'Elegant table arrangement with candles and florals. Romantic ambiance.',
    'Floral garland arch with vibrant blooms. Perfect for entranceways and photo spots.',
    'Wedding venue decor with ornate details. Transforms your space.',
    'Open air terrace setup with floral accents. Ideal for outdoor celebrations.',
    'Floral arch structure for ceremonies. Customizable with your color palette.',
    'Bouquet stand for bridal party flowers. Elegant and functional.',
    'Ceremony arch with fabric and floral draping. Creates a focal point.',
    'Garden decor pieces for outdoor weddings. Natural and charming.',
    'Romantic floral display for sweetheart tables. Intimate and beautiful.',
  ],
  All: [
    'Premium furniture piece for your wedding or event. Quality rental for memorable occasions.',
    'Elegant rental item to enhance your celebration. Professional setup included.',
    'Wedding collection item with timeless appeal. Perfect for your big day.',
    'Event furniture designed for style and comfort. Trusted by couples nationwide.',
  ],
}

function getDescription(category, indexInCategory) {
  const list = DESCRIPTIONS[category] || DESCRIPTIONS.All
  return list[indexInCategory % list.length]
}

function getDisplayName(category, indexInCategory) {
  const list = GENERAL_NAMES[category] || GENERAL_NAMES.All
  return list[indexInCategory % list.length]
}

function getDimensions(category) {
  const dims = {
    Chairs: ['18×18×34', '20×20×36', '22×22×35'],
    Tables: ['72×22×34', '60×30×30', '48×24×30'],
    Sofas: ['84×36×36', '96×40×38', '72×35×34'],
    Decor: ['12×12×24', '18×18×30', '24×24×36'],
    All: ['24×24×30'],
  }
  const arr = dims[category] || dims.All
  return arr[Math.floor(Math.random() * arr.length)] + ' inch'
}

function getPrice(category) {
  const ranges = { Chairs: [1500, 4000], Tables: [3000, 12000], Sofas: [6000, 15000], Decor: [800, 3500], All: [1000, 5000] }
  const [min, max] = ranges[category] || ranges.All
  return Math.round(min + Math.random() * (max - min) / 500) * 500
}

function processModule(path, mod, index) {
  const filename = path.split('/').pop()
  const id = filename.replace(/\s/g, '-').toLowerCase()
  const src = typeof mod === 'object' && mod?.default ? mod.default : mod
  const category = getCategory(filename)
  const prefix = CATEGORY_PREFIX[category] || 'OT'
  CATEGORY_COUNTS[prefix] = (CATEGORY_COUNTS[prefix] || 0) + 1
  const productCode = `${prefix}${CATEGORY_COUNTS[prefix]}`
  const indexInCategory = CATEGORY_COUNTS[prefix] - 1
  const displayName = getDisplayName(category, indexInCategory)
  const description = getDescription(category, indexInCategory)
  const item = {
    id,
    src,
    category,
    name: displayName,
    description,
    productCode,
    dimensions: getDimensions(category),
    price: getPrice(category),
    availableQty: 4 + Math.floor(Math.random() * 7),
  }
  if (category === 'Sofas' && SOFA_SUBCATEGORY_MAP[displayName]) {
    item.subCategory = SOFA_SUBCATEGORY_MAP[displayName]
  }
  return item
}

const EXCLUDED_IMAGES = [
  'png-wedding-chair-flowers-furniture-white_53876-634844.avif',
  'png-flower-flower-bouquet-graphics-pattern_53876-586881.avif',
]

const rawItems = Object.entries(modules)
  .filter(([path]) => !EXCLUDED_IMAGES.some((ex) => path.includes(ex)))
  .map(([path, mod], i) => processModule(path, mod, i))

// Group images by category for multi-image carousel
const imagesByCategory = {}
rawItems.forEach((item) => {
  const c = item.category
  if (!imagesByCategory[c]) imagesByCategory[c] = []
  imagesByCategory[c].push(item.src)
})

export const furnitureItems = rawItems.map((item) => {
  const categoryImages = imagesByCategory[item.category] || [item.src]
  const images = [item.src]
  categoryImages.forEach((src) => {
    if (!images.includes(src) && images.length < 4) images.push(src)
  })
  return { ...item, images: images.length >= 2 ? images : [item.src] }
})
