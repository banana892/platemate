import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  changePasswordSchema,
} from '../../../validators/auth.validator.js'

describe('Auth Validator Schemas', () => {
  describe('registerSchema', () => {
    it('should validate valid customer registration body', () => {
      const input = {
        body: {
          name: 'Arjun Kumar',
          email: 'arjun@example.com',
          password: 'Password@123',
          phone: '+919876543210',
          role: 'CUSTOMER',
        },
      }
      const result = registerSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('should reject invalid passwords lacking numbers or special chars', () => {
      const input = {
        body: {
          name: 'Arjun Kumar',
          email: 'arjun@example.com',
          password: 'weakpassword',
        },
      }
      const result = registerSchema.safeParse(input)
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('should validate valid login credentials', () => {
      const input = {
        body: {
          email: 'user@platemate.com',
          password: 'Password@123',
        },
      }
      const result = loginSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email format', () => {
      const input = {
        body: {
          email: 'invalid-email',
          password: 'Password@123',
        },
      }
      const result = loginSchema.safeParse(input)
      expect(result.success).toBe(false)
    })
  })

  describe('changePasswordSchema', () => {
    it('should validate current and new password fields', () => {
      const input = {
        body: {
          currentPassword: 'OldPassword@123',
          newPassword: 'NewPassword@456',
        },
      }
      const result = changePasswordSchema.safeParse(input)
      expect(result.success).toBe(true)
    })
  })
})
