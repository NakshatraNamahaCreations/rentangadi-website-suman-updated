/**
 * One request, shared by everyone who asks for it.
 *
 * Several sections ask for the same list as they mount - the header, the hero,
 * the category strip, the best-sellers row - and each one used to start its own
 * fetch. A single home page load asked the API for the product list eight
 * times, and that list is the slowest call the site makes.
 *
 * The in-flight promise is what does the real work. A plain time cache does not
 * help here, because the callers all start before the first response lands, so
 * every one of them sees an empty cache and fires again.
 */
export const createSharedFetch = (load, ttlMs) => {
  let value = null
  let loadedAt = 0
  let inFlight = null

  const shared = (force = false) => {
    if (!force && value !== null && Date.now() - loadedAt < ttlMs) {
      return Promise.resolve(value)
    }

    /* Someone is already asking; wait on theirs rather than adding another. */
    if (inFlight) return inFlight

    inFlight = load()
      .then((result) => {
        value = result
        loadedAt = Date.now()
        return result
      })
      .finally(() => {
        /* Cleared either way, so a failure does not wedge every later call. */
        inFlight = null
      })

    return inFlight
  }

  /* For when something has just been changed and the fresh list is wanted. */
  shared.invalidate = () => {
    value = null
    loadedAt = 0
  }

  return shared
}
