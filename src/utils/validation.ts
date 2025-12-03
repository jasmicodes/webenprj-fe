import * as yup from 'yup'

// Password validation
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{12,}$/

export const PASSWORD_REQUIREMENTS =
  'Min. 12 chars incl. upper, lower, number & symbol'

// Validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Invalid email address',
  WEAK_PASSWORD: PASSWORD_REQUIREMENTS,
  PASSWORDS_DONT_MATCH: 'Passwords must match',
  USERNAME_TOO_SHORT: 'Username must be at least 3 characters',
  USERNAME_INVALID: 'Username can only contain letters, numbers, and underscores',
} as const

// Reusable schema builders
export const createPasswordSchema = () =>
  yup
    .string()
    .required(VALIDATION_MESSAGES.REQUIRED)
    .matches(PASSWORD_REGEX, VALIDATION_MESSAGES.WEAK_PASSWORD)

export const createEmailSchema = () =>
  yup
    .string()
    .required(VALIDATION_MESSAGES.REQUIRED)
    .email(VALIDATION_MESSAGES.INVALID_EMAIL)

export const createUsernameSchema = () =>
  yup
    .string()
    .required(VALIDATION_MESSAGES.REQUIRED)
    .min(3, VALIDATION_MESSAGES.USERNAME_TOO_SHORT)
    .matches(/^[a-zA-Z0-9_]+$/, VALIDATION_MESSAGES.USERNAME_INVALID)

export const createPasswordConfirmSchema = (passwordField: string) =>
  yup
    .string()
    .required(VALIDATION_MESSAGES.REQUIRED)
    .oneOf([yup.ref(passwordField)], VALIDATION_MESSAGES.PASSWORDS_DONT_MATCH)
