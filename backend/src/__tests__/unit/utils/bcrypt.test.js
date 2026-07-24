import { hashPassword, comparePassword } from '../../../utils/bcrypt.js'

describe('Bcrypt Utilities', () => {
  const rawPassword = 'SecurePassword@123'

  it('should hash a password into a bcrypt hash', async () => {
    const hash = await hashPassword(rawPassword)
    expect(typeof hash).toBe('string')
    expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true)
    expect(hash).not.toBe(rawPassword)
  })

  it('should verify correct password against hash', async () => {
    const hash = await hashPassword(rawPassword)
    const matches = await comparePassword(rawPassword, hash)
    expect(matches).toBe(true)
  })

  it('should reject incorrect password', async () => {
    const hash = await hashPassword(rawPassword)
    const matches = await comparePassword('WrongPassword!999', hash)
    expect(matches).toBe(false)
  })

  it('should generate different salt hashes for identical passwords', async () => {
    const hash1 = await hashPassword(rawPassword)
    const hash2 = await hashPassword(rawPassword)
    expect(hash1).not.toBe(hash2)
  })
})
