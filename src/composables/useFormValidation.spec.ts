import { describe, it, expect } from 'vitest'
import { useFormValidation } from './useFormValidation'
import * as yup from 'yup'

describe('useFormValidation', () => {
  const testSchema = yup.object({
    email: yup.string().required('Email is required').email('Invalid email'),
    password: yup.string().required('Password is required').min(8, 'Password too short'),
  })

  describe('initial state', () => {
    it('should have empty errors initially', () => {
      const { errors } = useFormValidation(testSchema)

      expect(errors.value).toEqual({})
    })
  })

  describe('validate', () => {
    it('should return true for valid data', async () => {
      const { validate, errors } = useFormValidation(testSchema)

      const result = await validate({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result).toBe(true)
      expect(errors.value).toEqual({})
    })

    it('should return false for invalid data', async () => {
      const { validate } = useFormValidation(testSchema)

      const result = await validate({
        email: '',
        password: '',
      })

      expect(result).toBe(false)
    })

    it('should populate errors for invalid fields', async () => {
      const { validate, errors } = useFormValidation(testSchema)

      await validate({
        email: '',
        password: '',
      })

      expect(errors.value.email).toBe('Email is required')
      expect(errors.value.password).toBe('Password is required')
    })

    it('should show specific validation message for invalid email', async () => {
      const { validate, errors } = useFormValidation(testSchema)

      await validate({
        email: 'invalid-email',
        password: 'password123',
      })

      expect(errors.value.email).toBe('Invalid email')
    })

    it('should show specific validation message for short password', async () => {
      const { validate, errors } = useFormValidation(testSchema)

      await validate({
        email: 'test@example.com',
        password: 'short',
      })

      expect(errors.value.password).toBe('Password too short')
    })

    it('should clear previous errors on new validation', async () => {
      const { validate, errors } = useFormValidation(testSchema)

      await validate({ email: '', password: '' })
      expect(Object.keys(errors.value).length).toBeGreaterThan(0)

      await validate({ email: 'test@example.com', password: 'password123' })
      expect(errors.value).toEqual({})
    })
  })

  describe('clearErrors', () => {
    it('should clear all errors', async () => {
      const { validate, errors, clearErrors } = useFormValidation(testSchema)

      await validate({ email: '', password: '' })
      expect(Object.keys(errors.value).length).toBeGreaterThan(0)

      clearErrors()
      expect(errors.value).toEqual({})
    })
  })

  describe('non-validation errors', () => {
    it('should rethrow non-Yup errors', async () => {
      const errorSchema = yup.object({
        field: yup.string().test('custom', 'error', () => {
          throw new Error('Custom error')
        }),
      })

      const { validate } = useFormValidation(errorSchema)

      await expect(validate({ field: 'test' })).rejects.toThrow('Custom error')
    })
  })
})
