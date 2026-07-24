import { jest } from '@jest/globals'
import { buildUser } from '../../factories/index.js'
import { ApiError } from '../../../utils/ApiError.js'

// Mock dependencies
jest.unstable_mockModule('../../../repositories/auth.repository.js', () => ({
  findUserByEmail: jest.fn(),
  createUser: jest.fn(),
  createRefreshToken: jest.fn(),
  createVerificationToken: jest.fn().mockResolvedValue({ id: 'vtok_123' }),
}))

jest.unstable_mockModule('../../../utils/email.js', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  sendPasswordChangedEmail: jest.fn().mockResolvedValue(true),
}))

jest.unstable_mockModule('../../../security/security.service.js', () => ({
  checkLockout: jest.fn().mockResolvedValue(false),
  recordFailedAttempt: jest.fn().mockResolvedValue(),
  resetLockoutCounter: jest.fn().mockResolvedValue(),
}))

jest.unstable_mockModule('../../../security/audit.service.js', () => ({
  logSecurityEvent: jest.fn().mockResolvedValue(),
}))

jest.unstable_mockModule('../../../security/password.service.js', () => ({
  recordPasswordHistory: jest.fn().mockResolvedValue(),
  checkPasswordHistory: jest.fn().mockResolvedValue(false),
}))

// Import service after mocking dependencies dynamically
const authRepo = await import('../../../repositories/auth.repository.js')
const authService = await import('../../../services/auth.service.js')

describe('Auth Service Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should create a new user when email is not taken', async () => {
      const mockUser = buildUser({ email: 'new@example.com' })
      authRepo.findUserByEmail.mockResolvedValue(null)
      authRepo.createUser.mockResolvedValue(mockUser)

      const result = await authService.register({
        name: 'New User',
        email: 'new@example.com',
        password: 'Password@123',
      })

      expect(authRepo.findUserByEmail).toHaveBeenCalledWith('new@example.com')
      expect(authRepo.createUser).toHaveBeenCalled()
      expect(result.id).toBe(mockUser.id)
    })

    it('should throw Conflict error if email already exists', async () => {
      const mockUser = buildUser({ email: 'existing@example.com' })
      authRepo.findUserByEmail.mockResolvedValue(mockUser)

      await expect(
        authService.register({
          name: 'Test',
          email: 'existing@example.com',
          password: 'Password@123',
        })
      ).rejects.toThrow(ApiError)
    })
  })
})
