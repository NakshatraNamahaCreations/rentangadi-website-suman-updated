/**
 * Maps API ProductName values to mobile-clicked photos under src/assets/mobile-clicked.
 * 1) MOBILE_HOVER_MANUAL — exact normalized name → filename
 * 2) Heuristic — match filename stem to product name (prefer "stage" shots when ambiguous)
 */

const modules = import.meta.glob('../assets/mobile-clicked/**/*.{jpg,jpeg,png,JPG,JPEG}', {
  eager: true,
})

function moduleUrl(mod) {
  if (!mod) return null
  return mod.default ?? mod
}

function stripExtensions(filename) {
  let stem = filename
  while (/\.(jpe?g|png)$/i.test(stem)) {
    stem = stem.replace(/\.(jpe?g|png)$/i, '')
  }
  return stem.trim()
}

const fileEntries = []
for (const path of Object.keys(modules)) {
  const fileName = path.split(/[/\\]/).pop()
  const stem = stripExtensions(fileName)
  const url = moduleUrl(modules[path])
  if (!url) continue
  fileEntries.push({
    stem,
    stemLower: stem.toLowerCase(),
    fileName,
    url,
  })
}

/** Optional: exact API names (any casing) → exact filename in mobile-clicked */
export const MOBILE_HOVER_MANUAL = {
  // Example from CRM; add more when API strings don’t match files:
  // 'casa curve (3 seater)': 'Casa Curve Stage.jpeg',
}

function normalizeKey(name) {
  if (!name || typeof name !== 'string') return ''
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

function normalizeCore(name) {
  let s = normalizeKey(name)
  s = s.replace(/\([^)]*\)/g, ' ')
  s = s.replace(/[^a-z0-9\s]/g, ' ')
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

function manualLookup(productName) {
  const k = normalizeKey(productName)
  if (MOBILE_HOVER_MANUAL[k] != null) return MOBILE_HOVER_MANUAL[k]
  const lower = k
  for (const [key, filename] of Object.entries(MOBILE_HOVER_MANUAL)) {
    if (normalizeKey(key) === lower) return filename
  }
  return null
}

function resolveFilenameToUrl(filename) {
  if (!filename) return null
  const found = fileEntries.find((e) => e.fileName === filename)
  return found?.url ?? null
}

/**
 * @param {string} productName — e.g. item.ProductName from API
 * @returns {string|null} Vite-resolved image URL or null
 */
export function getMobileHoverImageUrl(productName) {
  const manualFile = manualLookup(productName)
  if (manualFile) {
    const u = resolveFilenameToUrl(manualFile)
    if (u) return u
  }

  const core = normalizeCore(productName)
  if (!core) return null

  const coreWords = core.split(/\s+/).filter((w) => w.length > 0)
  if (coreWords.length === 0) return null

  const prefix2 = coreWords.slice(0, 2).join(' ')
  const prefix3 = coreWords.slice(0, 3).join(' ')

  let candidates = fileEntries.filter((e) => {
    const st = e.stemLower
    return st === core || st.startsWith(prefix3) || st.startsWith(prefix2)
  })

  if (candidates.length === 0) {
    candidates = fileEntries.filter((e) => {
      const st = e.stemLower
      const beforePlus = st.split('+')[0].trim()
      return (
        st.includes(prefix2) ||
        prefix2.includes(beforePlus) ||
        beforePlus.includes(prefix2) ||
        core.includes(beforePlus)
      )
    })
  }

  if (candidates.length === 0) return null

  const stage = candidates.find((e) => e.stemLower.includes('stage'))
  if (stage) return stage.url

  candidates = [...candidates].sort((a, b) => a.stem.length - b.stem.length)
  return candidates[0].url
}
