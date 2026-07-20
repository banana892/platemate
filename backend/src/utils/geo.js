/**
 * Calculate the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 *
 * @param {number|object} lat1
 * @param {number|object} lon1
 * @param {number|object} [lat2]
 * @param {number|object} [lon2]
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Convert decimals if Prisma Decimal type is passed
  const l1 = Number(lat1)
  const ln1 = Number(lon1)
  const l2 = Number(lat2)
  const ln2 = Number(lon2)

  if (isNaN(l1) || isNaN(ln1) || isNaN(l2) || isNaN(ln2)) {
    return 0
  }

  const R = 6371 // Earth radius in km
  const dLat = ((l2 - l1) * Math.PI) / 180
  const dLon = ((ln2 - ln1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((l1 * Math.PI) / 180) *
      Math.cos((l2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return parseFloat(distance.toFixed(2)) // Round to 2 decimal places
}
