interface SearchableListing {
  name: string
  city: string | null
  postalCode: string | null
  beds: number | null
}

function normalizeSearchText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

/** Search only the property's location, postal code and name, never its description. */
export function filterListings<T extends SearchableListing>(listings: T[], query: string, minimumBeds = 0): T[] {
  const search = normalizeSearchText(query)
  const postalSearch = search.replace(/\s/g, '')

  return listings.filter((listing) => {
    if (minimumBeds > 0 && (listing.beds == null || listing.beds < minimumBeds)) return false
    if (!search) return true

    return normalizeSearchText(listing.city ?? '').includes(search) ||
      normalizeSearchText(listing.name).includes(search) ||
      normalizeSearchText(listing.postalCode ?? '').replace(/\s/g, '').includes(postalSearch)
  })
}
