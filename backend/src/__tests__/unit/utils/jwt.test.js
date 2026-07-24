import { jest } from '@jest/globals'
import {
  generateAccessToken,
  generateRefreshToken,
  generateEmailToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyEmailToken,
} from '../../../utils/jwt.js'

describe('JWT Utilities', () => {
  const mockUserPayload = {
    userId: 'usr_123456',
    email: 'test@platemate.com',
    role: 'CUSTOMER',
  }

  describe('generateAccessToken & verifyAccessToken', () => {
    it('should generate a valid access token and verify its payload', () => {
      const token = generateAccessToken(mockUserPayload)
      expect(typeof token).toBe('string')

      const decoded = verifyAccessToken(token)
      expect(decoded.userId).toBe(mockUserPayload.userId)
      expect(decoded.email).toBe(mockUserPayload.email)
      expect(decoded.role).toBe(mockUserPayload.role)
      expect(decoded.iss).toBe('platemate')
      expect(decoded.aud).toBe('platemate-client')
    })

    it('should throw unauthorized error when token is invalid or tampered', () => {
      expect(() => verifyAccessToken('invalid.token.str')).toThrow('Invalid authentication token.')
    })
  })

  describe('generateRefreshToken & verifyRefreshToken', () => {
    it('should generate a valid refresh token and verify payload', () => {
      const payload = { userId: 'usr_123456', tokenVersion: 1 }
      const token = generateRefreshToken(payload)
      expect(typeof token).toBe('string')

      const decoded = verifyRefreshToken(token)
      expect(decoded.userId).toBe(payload.userId)
      expect(decoded.tokenVersion).toBe(payload.tokenVersion)
    })

    it('should throw unauthorized error for invalid refresh token', () => {
      expect(() => verifyRefreshToken('bad_token')).toThrow('Invalid authentication token.')
    })
  })

  describe('generateEmailToken & verifyEmailToken', () => {
    it('should generate and verify an email verification/reset token', () => {
      const payload = { userId: 'usr_123456', type: 'verify' }
      const token = generateEmailToken(payload, '1h')
      expect(typeof token).toBe('string')

      const decoded = verifyEmailToken(token)
      expect(decoded.userId).toBe(payload.userId)
    })

    it('should throw for invalid email token', () => {
      expect(() => verifyEmailToken('corrupted.email.token')).toThrow('This link has expired or is invalid.')
    })
  })
})
