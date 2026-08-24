export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60)
}

// Appends a short random suffix to keep slugs unique without a DB round-trip loop.
export function uniqueSlug(input: string): string {
  const base = slugify(input) || 'item'
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${base}-${suffix}`
}
