import prisma from '../config/db.js'

/**
 * Find all addresses for a user, defaults first
 */
export const findAddressesByUserId = async (userId) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'desc' },
    ],
  })
}

/**
 * Find an address by ID
 */
export const findAddressById = async (id) => {
  return prisma.address.findUnique({
    where: { id },
  })
}

/**
 * Create a new address for a user.
 * If isDefault is true or if user has no existing addresses, set isDefault: true.
 */
export const createAddress = async (userId, data) => {
  return prisma.$transaction(async (tx) => {
    const existingCount = await tx.address.count({ where: { userId } })
    const shouldBeDefault = data.isDefault || existingCount === 0

    if (shouldBeDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    return tx.address.create({
      data: {
        ...data,
        isDefault: shouldBeDefault,
        userId,
      },
    })
  })
}

/**
 * Update an address.
 * If isDefault is true, all other user addresses are marked isDefault: false.
 */
export const updateAddress = async (id, userId, data) => {
  return prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    return tx.address.update({
      where: { id },
      data,
    })
  })
}

/**
 * Set an address as default for a user
 */
export const setDefaultAddress = async (id, userId) => {
  return prisma.$transaction(async (tx) => {
    await tx.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    })

    return tx.address.update({
      where: { id },
      data: { isDefault: true },
    })
  })
}

/**
 * Delete an address
 */
export const deleteAddress = async (id) => {
  return prisma.address.delete({
    where: { id },
  })
}

