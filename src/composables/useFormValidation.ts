import { ref } from 'vue'
import * as yup from 'yup'
import type { AnyObjectSchema } from 'yup'
import { mapYupErrors } from '@/utils/validation'

/**
 * Lightweight form validation helper: runs a Yup schema and exposes errors in a reactive map.
 */
export function useFormValidation(schema: AnyObjectSchema) {
  const errors = ref<Record<string, string>>({})

  const validate = async (payload: unknown) => {
    try {
      errors.value = {}
      await schema.validate(payload, { abortEarly: false })
      return true
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        errors.value = mapYupErrors(err)
        return false
      }
      throw err
    }
  }

  const clearErrors = () => {
    errors.value = {}
  }

  return {
    errors,
    validate,
    clearErrors,
  }
}
