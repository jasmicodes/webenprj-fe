<!-- src/components/molecules/EditProfileModal.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import * as yup from 'yup'
import { usersApi, adminUsersApi } from '@/services/api/users'
import { mediaApi } from '@/services/api'
import { useUserStore } from '@/stores/userStore'
import { useToastStore } from '@/stores/toastStore'
import { useFormValidation } from '@/composables/useFormValidation'
import { getErrorMessage } from '@/services/api/client'
import { COUNTRIES_DACH_FIRST } from '@/utils/countries'
import type { User, AdminUser, UserRole } from '@/services/api/types'

import BaseModal from '@/components/atoms/BaseModal.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseFormfield from '@/components/atoms/BaseFormfield.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseSelect from '@/components/atoms/BaseSelect.vue'
import UserAvatar from '@/components/molecules/UserAvatar.vue'
import UploadDropZone from '@/components/molecules/UploadDropZone.vue'

// -------------------- PROPS & EMITS --------------------
const props = defineProps<{
  /** User to edit - can be User or AdminUser */
  user: User | AdminUser | null
}>()

const emit = defineEmits<{
  (e: 'saved', user: User | AdminUser): void
}>()

const open = defineModel<boolean>({ required: true })

// -------------------- STORES --------------------
const userStore = useUserStore()
const toast = useToastStore()

// -------------------- PERMISSION LOGIC --------------------
const currentUserId = computed(() => userStore.user?.id)
const isAdmin = computed(() => userStore.user?.role === 'ADMIN')
const isEditingSelf = computed(() => props.user?.id === currentUserId.value)

// Admin can edit role/active for OTHER users, not themselves
const canEditAdminFields = computed(() => isAdmin.value && !isEditingSelf.value)

// -------------------- FORM STATE --------------------
const saving = ref(false)
const uploadingAvatar = ref(false)
const avatarPreview = ref<string | null>(null)

const form = ref({
  email: '',
  username: '',
  countryCode: '',
  profileImageUrl: '',
  salutation: '',
  role: 'USER' as UserRole,
  active: true,
})

// -------------------- VALIDATION --------------------
const baseSchema = yup.object({
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
  countryCode: yup.string().required('Country is required'),
  profileImageUrl: yup.string().notRequired(),
  salutation: yup.string().max(48, 'Salutation cannot exceed 48 characters').notRequired(),
  role: yup.string().oneOf(['USER', 'ADMIN']).required(),
  active: yup.boolean().required(),
})

const { errors, validate, clearErrors } = useFormValidation(baseSchema)

// -------------------- INIT FORM ON OPEN --------------------
watch(
  () => [open.value, props.user],
  ([isOpen, user]) => {
    if (isOpen && user) {
      initForm(user)
    }
  },
  { immediate: true }
)

function initForm(user: User | AdminUser) {
  form.value = {
    email: user.email ?? '',
    username: user.username ?? '',
    countryCode: user.countryCode ?? '',
    profileImageUrl: user.profileImageUrl ?? '',
    salutation: user.salutation ?? '',
    role: user.role ?? 'USER',
    active: 'active' in user ? user.active : true,
  }
  avatarPreview.value = null
  clearErrors()

  // Load avatar preview if user has one
  if (user.profileImageUrl) {
    loadAvatarPreview(user.profileImageUrl)
  }
}

async function loadAvatarPreview(url: string) {
  try {
    const mediaId = url.replace('/medias/', '')
    const blob = await mediaApi.retrieve(mediaId)
    avatarPreview.value = URL.createObjectURL(blob)
  } catch {
    // Silently fail - avatar just won't show preview
  }
}

// -------------------- AVATAR UPLOAD --------------------
async function onAvatarSelected(file: File) {
  uploadingAvatar.value = true
  try {
    const media = await mediaApi.upload(file)
    form.value.profileImageUrl = `/medias/${media.id}`
    const blob = await mediaApi.retrieve(media.id)
    avatarPreview.value = URL.createObjectURL(blob)
  } catch (err) {
    toast.showError(getErrorMessage(err))
  } finally {
    uploadingAvatar.value = false
  }
}

// -------------------- SAVE --------------------
async function handleSave() {
  clearErrors()
  toast.clear()

  const valid = await validate(form.value)
  if (!valid) {
    toast.showError('Please fix the highlighted fields')
    return
  }

  saving.value = true

  try {
    let updatedUser: User | AdminUser

    if (isEditingSelf.value) {
      // Self-edit: use regular user API
      const currentUser = userStore.user!
      const credentialsChanged =
        currentUser.email !== form.value.email ||
        currentUser.username !== form.value.username

      updatedUser = await usersApi.updateMyProfile({
        email: form.value.email,
        username: form.value.username,
        countryCode: form.value.countryCode,
        profileImageUrl: form.value.profileImageUrl || undefined,
        salutation: form.value.salutation || undefined,
      })

      // If credentials changed, force re-login
      if (credentialsChanged) {
        toast.showSuccess('Credentials updated. Please log in again.')
        userStore.logout()
        return
      }

      // Update local user store
      userStore.user = updatedUser
    } else {
      // Admin editing another user
      updatedUser = await adminUsersApi.updateUser(props.user!.id, {
        email: form.value.email,
        username: form.value.username,
        countryCode: form.value.countryCode,
        profileImageUrl: form.value.profileImageUrl || undefined,
        role: form.value.role,
        active: form.value.active,
      })
    }

    toast.showSuccess('Profile updated successfully')
    emit('saved', updatedUser)
    open.value = false
  } catch (err) {
    toast.showError(getErrorMessage(err))
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  open.value = false
}
</script>

<template>
  <BaseModal v-model="open" :closable="true" :close-on-backdrop="!saving">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100">
        <h2 class="text-base font-semibold text-slate-900">
          {{ isEditingSelf ? 'Edit Profile' : `Edit ${user?.username}` }}
        </h2>
        <p class="text-sm text-slate-500 mt-0.5">
          {{ isEditingSelf ? 'Update your public profile' : 'Manage user account' }}
        </p>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
        <!-- Avatar Upload -->
        <div class="flex items-center gap-4">
          <UserAvatar
            v-if="avatarPreview"
            :src="avatarPreview"
            class="w-16 h-16 rounded-full object-cover ring-2 ring-slate-100"
          />
          <UserAvatar v-else class="w-16 h-16 rounded-full object-cover ring-2 ring-slate-100" />
          <UploadDropZone accept="image/*" @selected="onAvatarSelected">
            <BaseButton variant="outline" size="sm" :disabled="uploadingAvatar">
              {{ uploadingAvatar ? 'Uploading...' : 'Change photo' }}
            </BaseButton>
          </UploadDropZone>
        </div>

        <!-- Basic Fields (everyone can edit) -->
        <div class="space-y-4">
          <BaseFormfield label="Email" :error="errors.email">
            <BaseInput
              v-model="form.email"
              type="email"
              :invalid="!!errors.email"
              placeholder="Email address"
            />
          </BaseFormfield>

          <BaseFormfield label="Username" :error="errors.username">
            <BaseInput
              v-model="form.username"
              :invalid="!!errors.username"
              placeholder="Username"
            />
          </BaseFormfield>

          <BaseFormfield label="Salutation" :error="errors.salutation" help="Optional title (e.g., Dr., Prof.)">
            <BaseInput
              v-model="form.salutation"
              :invalid="!!errors.salutation"
              placeholder="e.g., Dr., Prof., or leave empty"
              maxlength="48"
            />
          </BaseFormfield>

          <BaseFormfield label="Country" :error="errors.countryCode">
            <BaseSelect v-model="form.countryCode" :invalid="!!errors.countryCode">
              <option value="" disabled>Select country...</option>
              <option v-for="c in COUNTRIES_DACH_FIRST" :key="c.code" :value="c.code">
                {{ c.label }}
              </option>
            </BaseSelect>
          </BaseFormfield>
        </div>

        <!-- Admin-only Fields (when editing other users) -->
        <div v-if="canEditAdminFields" class="pt-4 border-t border-slate-100 space-y-4">
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Admin Controls
          </p>

          <BaseFormfield label="Role" :error="errors.role">
            <BaseSelect v-model="form.role" :invalid="!!errors.role">
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </BaseSelect>
          </BaseFormfield>

          <div class="flex items-center justify-between py-2">
            <div>
              <p class="text-sm font-medium text-slate-900">Account Status</p>
              <p class="text-xs text-slate-500">
                {{ form.active ? 'User can access the platform' : 'User is blocked from accessing' }}
              </p>
            </div>
            <button
              type="button"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              :class="form.active ? 'bg-emerald-500' : 'bg-slate-300'"
              @click="form.active = !form.active"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                :class="form.active ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <BaseButton variant="ghost" size="sm" :disabled="saving" @click="handleCancel">
          Cancel
        </BaseButton>
        <BaseButton variant="primary" size="sm" :disabled="saving" @click="handleSave">
          {{ saving ? 'Saving...' : 'Save changes' }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
