// /**
// Groups subcategories by main category and removes duplicates.
// Keeps only the first occurrence of duplicate subcategories.

export function groupSubcategoriesByCategory(subcategories) {
 if (!Array.isArray(subcategories)) return {}

 const grouped = {}

 const skipCategories = ['test', 'rameshtest']

 for (const item of subcategories) {

   const category = (item.category || 'Other').trim()
   const subName = (item.subcategory || '').trim()

   if (!subName) continue

   if (skipCategories.includes(category.toLowerCase())) continue

   if (!grouped[category]) {
     grouped[category] = []
   }

   const exists = grouped[category].some(
     (s) => s.subcategory.toLowerCase() === subName.toLowerCase()
   )

   if (!exists) {
     grouped[category].push(item)
   }
 }

 return grouped
}


/**
* Convert grouped object to array for easier rendering
*/
export function getCategoriesWithSubs(grouped) {

 return Object.entries(grouped).map(([category, subcategories]) => ({
   category,
   subcategories
 }))

}