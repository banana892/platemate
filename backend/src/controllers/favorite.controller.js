import { HTTP } from '../constants/httpStatus.js'
import * as favoriteService from '../services/favorite.service.js'
import asyncHandler from '../middleware/asyncHandler.js'

export const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await favoriteService.getFavorites(req.user.id)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Favorite restaurants retrieved successfully',
    data: favorites,
  })
})

export const addFavorite = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params
  const result = await favoriteService.addFavorite(req.user.id, restaurantId)
  res.status(HTTP.CREATED).json({
    success: true,
    message: 'Restaurant added to favorites',
    data: result,
  })
})

export const removeFavorite = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params
  const result = await favoriteService.removeFavorite(req.user.id, restaurantId)
  res.status(HTTP.OK).json({
    success: true,
    message: 'Restaurant removed from favorites',
    data: result,
  })
})
