import { HTTP } from '../constants/httpStatus.js'
import { MSG } from '../constants/messages.js'
import asyncHandler from '../middleware/asyncHandler.js'
import * as authService from '../services/auth.service.js'
import * as authRepo from '../repositories/auth.repository.js'
import * as userService from '../services/user.service.js'
import * as mediaService from '../services/media.service.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { clearRefreshTokenCookie } from '../utils/cookie.js'

export const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id)
  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, MSG.PROFILE_FETCHED, user)
  )
})

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body || {}
  const user = await authRepo.updateUser(req.user.id, {
    ...(name && { name }),
    ...(phone !== undefined && { phone }),
    ...(avatar && { avatar }),
  })
  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, MSG.RIDER_PROFILE_UPDATED || 'Profile updated successfully.', user)
  )
})

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {}
  await authService.changePassword(req.user.id, currentPassword, newPassword, { req })
  clearRefreshTokenCookie(res)
  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, MSG.PASSWORD_CHANGE_SUCCESS)
  )
})

export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { confirmation, password } = req.body || {}

  await userService.deleteAccount({ userId, confirmation, password })

  // Blacklist active access token in Redis
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      const crypto = await import('crypto')
      const jwt = await import('jsonwebtoken')
      const { blacklistToken } = await import('../redis/redis.service.js')
      const payload = jwt.default.decode(token)
      if (payload && payload.exp) {
        const remainingTime = payload.exp - Math.floor(Date.now() / 1000)
        if (remainingTime > 0) {
          const signature = token.split('.')[2] || token
          const tokenIdentifier = crypto.default.createHash('sha256').update(signature).digest('hex')
          await blacklistToken(tokenIdentifier, remainingTime)
        }
      }
    } catch (_err) {}
  }

  // Clear refresh token cookie
  clearRefreshTokenCookie(res)

  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, 'Account deleted successfully.')
  )
})

export const updateProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(HTTP.BAD_REQUEST, 'No file provided for profile image.')
  }

  const result = await mediaService.updateProfileImage(req.user.id, req.file.buffer)

  res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, 'Profile image updated successfully.', result)
  )
})
