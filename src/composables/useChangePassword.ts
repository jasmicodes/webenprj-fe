// src/composables/useChangePassword.ts
import { ref } from 'vue'
import * as yup from 'yup'

import { usersApi } from '@/services/api/users'
import { useToastStore } from '@/stores/toastStore'
import { useUserStore } from '@/stores/userStore'
import { useFormValidation } from '@/composables/useFormValidation'
import { getErrorMessage } from '@/services/api/client'

export function useChangePassword() {
  const toast = useToastStore()
  const userStore = useUserStore()

  const showChangePassword = ref(false)
  const savingPassword = ref(false)

  const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    repeatPassword: '',
  })

  const passwordSchema = yup.object({
    currentPassword: yup.string().required('Current password is required'),

    newPassword: yup
      .string()
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
        'Password must contain uppercase, lowercase and a number',
      )
      .required('New password is required'),

    repeatPassword: yup
      .string()
      .oneOf([yup.ref('newPassword')], 'Passwords do not match')
      .required('Please repeat the new password'),
  })

  const {
    errors: passwordErrors,
    validate: validatePassword,
    clearErrors: clearPasswordErrors,
  } = useFormValidation(passwordSchema)

  async function savePassword() {
    clearPasswordErrors()
    toast.clear()

    const ok = await validatePassword(passwordForm.value)
    if (!ok) {
      toast.showError('Please fix the highlighted fields')
      return
    }

    savingPassword.value = true
    try {
      await usersApi.changePassword({
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword,
      })

      toast.showSuccess('Password changed successfully. Please log in again.')

      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        repeatPassword: '',
      }

      // for safety: end session
      userStore.logout()
    } catch (err) {
      toast.showError(getErrorMessage(err))
    } finally {
      savingPassword.value = false
    }
  }

  return {
    // state
    showChangePassword,
    savingPassword,
    passwordForm,
    passwordErrors,

    // actions
    savePassword,
  }
}
