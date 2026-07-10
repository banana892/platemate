// PlateMate Helper Functions

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function truncate(str, maxLength = 50) {
  if (!str) return ''
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str
}

export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function getDeliveryTimeText(minutes) {
  if (minutes < 60) return `${minutes} mins`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours} hr ${mins} mins` : `${hours} hr`
}

export function getRatingColor(rating) {
  if (rating >= 4.0) return 'bg-green-600'
  if (rating >= 3.0) return 'bg-yellow-500'
  if (rating >= 2.0) return 'bg-orange-500'
  return 'bg-red-500'
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
