/**
 * user.routes.js — User Profile Route Definitions
 *
 * GET    /users/profile          — get own profile
 * PATCH  /users/profile          — update own profile
 * PATCH  /users/change-password  — change password
 * DELETE /users/account          — delete own account (soft delete)
 */

import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import * as userController from '../controllers/user.controller.js'

const router = Router()

// All user routes require authentication
router.use(authenticate)

router.get('/profile', userController.getProfile)
router.patch('/profile', userController.updateProfile)
router.patch('/change-password', userController.changePassword)
router.delete('/account', userController.deleteAccount)

export default router
