import { describe, it, expect } from 'vitest'
import * as yup from 'yup'
import {
  PASSWORD_REGEX,
  PASSWORD_REQUIREMENTS,
  VALIDATION_MESSAGES,
  mapYupErrors,
  createPasswordSchema,
  createEmailSchema,
  createUsernameSchema,
  createPostSubjectSchema,
  createPostContentSchema,
  createPasswordConfirmSchema,
} from './validation'

describe('validation utilities', () => {
  describe('PASSWORD_REGEX', () => {
    it('should match valid password with all requirements', () => {
      expect(PASSWORD_REGEX.test('MyPassword123!')).toBe(true)
    })

    it('should reject password without uppercase', () => {
      expect(PASSWORD_REGEX.test('mypassword123!')).toBe(false)
    })

    it('should reject password without lowercase', () => {
      expect(PASSWORD_REGEX.test('MYPASSWORD123!')).toBe(false)
    })

    it('should reject password without number', () => {
      expect(PASSWORD_REGEX.test('MyPasswordHere!')).toBe(false)
    })

    it('should reject password without special character', () => {
      expect(PASSWORD_REGEX.test('MyPassword1234')).toBe(false)
    })

    it('should reject password shorter than 12 characters', () => {
      expect(PASSWORD_REGEX.test('MyPass123!')).toBe(false)
    })
  })

  describe('mapYupErrors', () => {
    it('should map validation errors to field-message pairs', async () => {
      const schema = yup.object({
        email: yup.string().required('Email required'),
        name: yup.string().required('Name required'),
      })

      try {
        await schema.validate({ email: '', name: '' }, { abortEarly: false })
      } catch (err) {
        const mapped = mapYupErrors(err as yup.ValidationError)

        expect(mapped.email).toBe('Email required')
        expect(mapped.name).toBe('Name required')
      }
    })

    it('should only keep first error for each field', async () => {
      const schema = yup.object({
        password: yup.string().required('Required').min(8, 'Too short'),
      })

      try {
        await schema.validate({ password: '' }, { abortEarly: false })
      } catch (err) {
        const mapped = mapYupErrors(err as yup.ValidationError)

        // First error should be kept
        expect(mapped.password).toBe('Required')
      }
    })
  })

  describe('createPasswordSchema', () => {
    it('should validate correct password', async () => {
      const schema = createPasswordSchema()

      await expect(schema.validate('MySecurePass123!')).resolves.toBe('MySecurePass123!')
    })

    it('should reject empty password', async () => {
      const schema = createPasswordSchema()

      await expect(schema.validate('')).rejects.toThrow(VALIDATION_MESSAGES.REQUIRED)
    })

    it('should reject weak password', async () => {
      const schema = createPasswordSchema()

      await expect(schema.validate('weak')).rejects.toThrow(PASSWORD_REQUIREMENTS)
    })
  })

  describe('createEmailSchema', () => {
    it('should validate correct email', async () => {
      const schema = createEmailSchema()

      await expect(schema.validate('test@example.com')).resolves.toBe('test@example.com')
    })

    it('should reject empty email', async () => {
      const schema = createEmailSchema()

      await expect(schema.validate('')).rejects.toThrow(VALIDATION_MESSAGES.REQUIRED)
    })

    it('should reject invalid email', async () => {
      const schema = createEmailSchema()

      await expect(schema.validate('not-an-email')).rejects.toThrow(VALIDATION_MESSAGES.INVALID_EMAIL)
    })
  })

  describe('createUsernameSchema', () => {
    it('should validate correct username', async () => {
      const schema = createUsernameSchema()

      await expect(schema.validate('validUser123')).resolves.toBe('validUser123')
    })

    it('should trim whitespace', async () => {
      const schema = createUsernameSchema()

      await expect(schema.validate('  username  ')).resolves.toBe('username')
    })

    it('should reject empty username', async () => {
      const schema = createUsernameSchema()

      await expect(schema.validate('')).rejects.toThrow(VALIDATION_MESSAGES.REQUIRED)
    })

    it('should reject username shorter than 5 characters', async () => {
      const schema = createUsernameSchema()

      await expect(schema.validate('ab')).rejects.toThrow(VALIDATION_MESSAGES.USERNAME_TOO_SHORT)
    })

    it('should reject username with invalid characters', async () => {
      const schema = createUsernameSchema()

      await expect(schema.validate('user@name')).rejects.toThrow(VALIDATION_MESSAGES.USERNAME_INVALID)
    })

    it('should allow underscores', async () => {
      const schema = createUsernameSchema()

      await expect(schema.validate('user_name')).resolves.toBe('user_name')
    })
  })

  describe('createPostSubjectSchema', () => {
    it('should validate correct subject', async () => {
      const schema = createPostSubjectSchema()

      await expect(schema.validate('My Subject')).resolves.toBe('My Subject')
    })

    it('should allow hashtag prefix', async () => {
      const schema = createPostSubjectSchema()

      await expect(schema.validate('#webdev')).resolves.toBe('#webdev')
    })

    it('should reject empty subject', async () => {
      const schema = createPostSubjectSchema()

      await expect(schema.validate('')).rejects.toThrow(VALIDATION_MESSAGES.REQUIRED)
    })

    it('should reject subject shorter than 2 characters', async () => {
      const schema = createPostSubjectSchema()

      await expect(schema.validate('a')).rejects.toThrow()
    })

    it('should reject subject longer than 30 characters', async () => {
      const schema = createPostSubjectSchema()

      const longSubject = 'a'.repeat(35)
      await expect(schema.validate(longSubject)).rejects.toThrow()
    })
  })

  describe('createPostContentSchema', () => {
    it('should validate correct content', async () => {
      const schema = createPostContentSchema()

      const content = 'This is valid post content with enough characters.'
      await expect(schema.validate(content)).resolves.toBe(content)
    })

    it('should reject empty content', async () => {
      const schema = createPostContentSchema()

      await expect(schema.validate('')).rejects.toThrow(VALIDATION_MESSAGES.REQUIRED)
    })

    it('should reject content shorter than 10 characters', async () => {
      const schema = createPostContentSchema()

      await expect(schema.validate('short')).rejects.toThrow(VALIDATION_MESSAGES.CONTENT_LENGTH)
    })

    it('should reject content longer than 500 characters', async () => {
      const schema = createPostContentSchema()

      const longContent = 'a'.repeat(501)
      await expect(schema.validate(longContent)).rejects.toThrow(VALIDATION_MESSAGES.CONTENT_LENGTH)
    })
  })

  describe('createPasswordConfirmSchema', () => {
    it('should validate matching passwords', async () => {
      const schema = yup.object({
        password: yup.string().required(),
        confirmPassword: createPasswordConfirmSchema('password'),
      })

      await expect(
        schema.validate({
          password: 'mypassword',
          confirmPassword: 'mypassword',
        })
      ).resolves.toBeDefined()
    })

    it('should reject non-matching passwords', async () => {
      const schema = yup.object({
        password: yup.string().required(),
        confirmPassword: createPasswordConfirmSchema('password'),
      })

      await expect(
        schema.validate({
          password: 'mypassword',
          confirmPassword: 'different',
        })
      ).rejects.toThrow(VALIDATION_MESSAGES.PASSWORDS_DONT_MATCH)
    })

    it('should require confirm password field', async () => {
      const schema = yup.object({
        password: yup.string().required(),
        confirmPassword: createPasswordConfirmSchema('password'),
      })

      // Empty string fails validation (either required or passwords don't match)
      await expect(
        schema.validate({
          password: 'mypassword',
          confirmPassword: '',
        })
      ).rejects.toThrow()
    })
  })

  describe('VALIDATION_MESSAGES', () => {
    it('should have all expected messages', () => {
      expect(VALIDATION_MESSAGES.REQUIRED).toBeDefined()
      expect(VALIDATION_MESSAGES.INVALID_EMAIL).toBeDefined()
      expect(VALIDATION_MESSAGES.WEAK_PASSWORD).toBeDefined()
      expect(VALIDATION_MESSAGES.PASSWORDS_DONT_MATCH).toBeDefined()
      expect(VALIDATION_MESSAGES.USERNAME_TOO_SHORT).toBeDefined()
      expect(VALIDATION_MESSAGES.USERNAME_INVALID).toBeDefined()
      expect(VALIDATION_MESSAGES.SUBJECT_INVALID).toBeDefined()
      expect(VALIDATION_MESSAGES.SUBJECT_LENGTH).toBeDefined()
      expect(VALIDATION_MESSAGES.CONTENT_LENGTH).toBeDefined()
    })
  })
})
