/**
 * user.service.js — User Account & Profile Business Logic
 */

import prisma from '../config/db.js'
import { ApiError } from '../utils/ApiError.js'
import { HTTP } from '../constants/httpStatus.js'
import { MSG } from '../constants/messages.js'
import { comparePassword } from '../utils/bcrypt.js'

/**
 * Perform a soft-deletion of a user account and clean up sensitive user data
 * while preserving historical orders and maintaining referential integrity.
 *
 * @param {object} params
 * @param {string} params.userId - Authenticated user ID
 * @param {string} [params.password] - User password (optional for Google OAuth users)
 * @param {string} params.confirmation - Confirmation string ('DELETE' or user's email)
 */
export const deleteAccount = async ({ userId, password, confirmation }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      password: true,
      isActive: true,
      tokenVersion: true,
      deletedAt: true,
    },
  })

  if (!user || user.deletedAt) {
    throw new ApiError(HTTP.UNAUTHORIZED, MSG.UNAUTHORIZED)
  }

  if (user.role === 'ADMIN') {
    throw new ApiError(HTTP.FORBIDDEN, 'Admin accounts cannot be deleted through this endpoint.')
  }

  // 1. Validate confirmation string ('DELETE' or exact user email)
  const normConfirm = (confirmation || '').trim().toLowerCase()
  const normEmail = (user.email || '').trim().toLowerCase()

  if (normConfirm !== 'delete' && normConfirm !== normEmail) {
    throw new ApiError(
      HTTP.BAD_REQUEST,
      "Invalid confirmation string. Must type 'DELETE' or your email address."
    )
  }

  // 2. Validate password if provided or required
  if (password) {
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      throw new ApiError(HTTP.UNAUTHORIZED, 'Invalid password.')
    }
  }

  // 3. Perform soft-deletion and atomic cleanup in a transaction
  return prisma.$transaction(async (tx) => {
    // Clean up peripheral user data
    await tx.address.deleteMany({ where: { userId } })
    await tx.refreshToken.deleteMany({ where: { userId } })
    await tx.verificationToken.deleteMany({ where: { userId } })
    await tx.cart.deleteMany({ where: { userId } })
    await tx.favorite.deleteMany({ where: { userId } })
    await tx.notification.deleteMany({ where: { userId } })
    await tx.passwordHistory.deleteMany({ where: { userId } })

    // Soft-delete user record & anonymize personal info
    const anonymizedEmail = `deleted_${Date.now()}_${user.email}`

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        email: anonymizedEmail,
        name: 'Deleted User',
        phone: null,
        avatar: null,
        imageUrl: null,
        publicId: null,
        isActive: false,
        deletedAt: new Date(),
        tokenVersion: { increment: 1 },
      },
    })

    return updatedUser
  })
}
