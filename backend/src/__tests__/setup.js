import { jest } from '@jest/globals'

process.env.NODE_ENV = 'test'
process.env.JWT_ACCESS_SECRET = 'test_access_secret_12345678901234567890'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_12345678901234567890'
process.env.JWT_ACCESS_EXPIRES = '15m'
process.env.JWT_REFRESH_EXPIRES = '7d'
process.env.BCRYPT_ROUNDS = '4'

beforeEach(() => {
  jest.clearAllMocks()
})
