// src/composables/useProfileForm.ts
import { ref } from 'vue'
import * as yup from 'yup'

import { usersApi } from '@/services/api/users'
import { useToastStore } from '@/stores/toastStore'
import { useFormValidation } from '@/composables/useFormValidation'
import { getErrorMessage } from '@/services/api/client'
import type { User } from '@/services/api/types'

export function useProfileForm() {
  const toast = useToastStore()

  const showEditProfile = ref(false)
  const savingProfile = ref(false)

  const editForm = ref({
    email: '',
    username: '',
    countryCode: '',
    profileImageUrl: '',
  })

  const profileSchema = yup.object({
    email: yup
      .string()
      .transform((v) => v?.trim())
      .email('Email must be a valid email address')
      .required('Email is required'),

    username: yup
      .string()
      .transform((v) => v?.trim())
      .min(5, 'Username must be between 5 and 50 characters')
      .max(50, 'Username must be between 5 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
      .required('Username is required'),

    countryCode: yup.string().required('Country code is required'),

    profileImageUrl: yup.string().notRequired(),
  })

  const {
    errors: editErrors,
    validate: validateEdit,
    clearErrors: clearEditErrors,
  } = useFormValidation(profileSchema)

  function initEditForm(user: User) {
    editForm.value = {
      email: user.email ?? '',
      username: user.username ?? '',
      countryCode: user.countryCode ?? '',
      profileImageUrl: user.profileImageUrl ?? '',
    }
  }

  async function saveProfile(onSuccess?: (updatedUser: User) => void) {
    clearEditErrors()
    toast.clear()

    const ok = await validateEdit(editForm.value)
    if (!ok) {
      toast.showError('Please fix the highlighted fields')
      return
    }

    savingProfile.value = true
    try {
      const updated = await usersApi.updateMyProfile({
        email: editForm.value.email,
        username: editForm.value.username,
        countryCode: editForm.value.countryCode,
        profileImageUrl: editForm.value.profileImageUrl || undefined,
      })

      toast.showSuccess('Profile updated successfully')
      showEditProfile.value = false
      if (onSuccess) {
        onSuccess(updated)
      }
    } catch (err) {
      toast.showError(getErrorMessage(err))
    } finally {
      savingProfile.value = false
    }
  }

  return {
    showEditProfile,
    savingProfile,
    editForm,
    editErrors,
    initEditForm,
    saveProfile,
  }
}
