/**
 * Main categories and their sub-categories for the Category section.
 * Sub-category "key" is used to filter products by name (case-insensitive).
 */
export const CATEGORIES = [
  {
    id: 'Chairs',
    name: 'Chairs',
    subCategories: [
      { key: 'all', label: 'All Chairs' },
      { key: 'chiavari', label: 'Chiavari' },
      { key: 'wedding', label: 'Wedding' },
      { key: 'lounge', label: 'Lounge' },
      { key: 'banquet', label: 'Banquet' },
    ],
  },
  {
    id: 'Tables',
    name: 'Tables',
    subCategories: [
      { key: 'all', label: 'All Tables' },
      { key: 'reception', label: 'Reception' },
      { key: 'dining', label: 'Dining' },
      { key: 'console', label: 'Console' },
      { key: 'cocktail', label: 'Cocktail' },
    ],
  },
  {
    id: 'Sofas',
    name: 'Sofas',
    subCategories: [
      { key: 'all', label: 'All Sofas' },
      { key: 'lounge', label: 'Lounge' },
      { key: 'velvet', label: 'Velvet' },
      { key: 'classic', label: 'Classic' },
      { key: 'event', label: 'Event' },
    ],
  },
  {
    id: 'Decor',
    name: 'Decor',
    subCategories: [
      { key: 'all', label: 'All Decor' },
      { key: 'floral', label: 'Floral' },
      { key: 'arch', label: 'Arch' },
      { key: 'centerpiece', label: 'Centerpiece' },
      { key: 'bouquet', label: 'Bouquet' },
    ],
  },
]
