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
  SUBJECT_INVALID:
    "Subject can include letters, numbers, spaces, dashes, underscores, and optional leading '#'",
  SUBJECT_LENGTH: 'Subject must be between 2 and 30 characters',
  CONTENT_LENGTH: 'Content must be between 10 and 500 characters',
} as const

// Utility: map Yup validation errors into a simple field -> message record
export const mapYupErrors = (err: yup.ValidationError) => {
  const map: Record<string, string> = {}
  err.inner.forEach((e) => {
    if (e.path && !map[e.path]) {
      map[e.path] = e.message
    }
  })
  return map
}

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

export const createPostSubjectSchema = () =>
  yup
    .string()
    .required(VALIDATION_MESSAGES.REQUIRED)
    .min(2, VALIDATION_MESSAGES.SUBJECT_LENGTH)
    .max(30, VALIDATION_MESSAGES.SUBJECT_LENGTH)
    .matches(/^#?[A-Za-z0-9_\-\s]{2,30}$/, VALIDATION_MESSAGES.SUBJECT_INVALID)

export const createPostContentSchema = () =>
  yup
    .string()
    .required(VALIDATION_MESSAGES.REQUIRED)
    .min(10, VALIDATION_MESSAGES.CONTENT_LENGTH)
    .max(500, VALIDATION_MESSAGES.CONTENT_LENGTH)

export const createPasswordConfirmSchema = (passwordField: string) =>
  yup
    .string()
    .required(VALIDATION_MESSAGES.REQUIRED)
    .oneOf([yup.ref(passwordField)], VALIDATION_MESSAGES.PASSWORDS_DONT_MATCH)
