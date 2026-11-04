/**
 * Extra angles for "Pink Hector Sofa (3 Seater)" in Our Collection.
 * The CRM `ProductIcon` image is always first in `images[]`; these are appended after it.
 * Files live under src/assets/mobile-clicked.
 */
import imgAuraMatrix from '../assets/mobile-clicked/Baby Pink + Aura Side Table + Matrix Center Table.jpg.jpeg'
import imgOctogen from '../assets/mobile-clicked/Baby Pink + Octogen center table.jpg'
import imgOttoman from '../assets/mobile-clicked/Baby Pink + Ottoman 1.jpg'
import imgSilverChair from '../assets/mobile-clicked/Baby Pink + Silver Chair.jpg'
import imgWhiteWooden from '../assets/mobile-clicked/Baby Pink + White wooden center.jpg'

export const PINK_HECTOR_THREE_SEATER_GALLERY = [
  imgAuraMatrix,
  imgOctogen,
  imgOttoman,
  imgSilverChair,
  imgWhiteWooden,
]

/** Match CRM / display name variants for this SKU */
export function isPinkHectorThreeSeater(productName) {
  if (!productName || typeof productName !== 'string') return false
  const n = productName.trim().toLowerCase()
  const hasPinkHector = n.includes('pink hector') || n.includes('pink hector sofa')
  const isThree =
    n.includes('3 seater') ||
    n.includes('3-seater') ||
    /\(\s*3\s*seater\s*\)/i.test(productName) ||
    n.includes('(3')
  return hasPinkHector && isThree
}
