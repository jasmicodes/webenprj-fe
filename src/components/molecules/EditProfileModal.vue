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

// Original values for change detection
const originalValues = ref({
  username: '',
  salutation: '',
  profileImageUrl: '',
  role: 'USER' as UserRole,
  active: true,
})

const form = ref({
  username: '',
  salutation: '',
  profileImageUrl: '',
  role: 'USER' as UserRole,
  active: true,
})

// -------------------- CHANGE DETECTION --------------------
const hasChanges = computed(() => {
  return (
    form.value.username !== originalValues.value.username ||
    form.value.salutation !== originalValues.value.salutation ||
    form.value.profileImageUrl !== originalValues.value.profileImageUrl ||
    (canEditAdminFields.value && form.value.role !== originalValues.value.role) ||
    (canEditAdminFields.value && form.value.active !== originalValues.value.active)
  )
})

// -------------------- VALIDATION --------------------
const schema = yup.object({
  username: yup
    .string()
    .transform((v) => v?.trim())
    .min(5, 'Username must be between 5 and 50 characters')
    .max(50, 'Username must be between 5 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  salutation: yup.string().max(48, 'Salutation cannot exceed 48 characters').notRequired(),
  profileImageUrl: yup.string().notRequired(),
  role: yup.string().oneOf(['USER', 'ADMIN']).required(),
  active: yup.boolean().required(),
})

const { errors, validate, clearErrors } = useFormValidation(schema)

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
  const values = {
    username: user.username ?? '',
    salutation: user.salutation ?? '',
    profileImageUrl: user.profileImageUrl ?? '',
    role: user.role ?? 'USER',
    active: 'active' in user ? user.active : true,
  }

  form.value = { ...values }
  originalValues.value = { ...values }
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
      // Self-edit: use regular user API (email comes from current user)
      const currentUser = userStore.user!
      const usernameChanged = currentUser.username !== form.value.username

      updatedUser = await usersApi.updateMyProfile({
        email: currentUser.email, // Keep current email
        username: form.value.username,
        countryCode: currentUser.countryCode, // Keep current country
        profileImageUrl: form.value.profileImageUrl || undefined,
        salutation: form.value.salutation || undefined,
      })

      // If username changed, force re-login
      if (usernameChanged) {
        toast.showSuccess('Username updated. Please log in again.')
        userStore.logout()
        return
      }

      // Update local user store
      userStore.user = updatedUser
    } else {
      // Admin editing another user (email not editable here either)
      const targetUser = props.user!
      updatedUser = await adminUsersApi.updateUser(targetUser.id, {
        email: targetUser.email, // Keep current email
        username: form.value.username,
        countryCode: targetUser.countryCode, // Keep current country
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
          {{ isEditingSelf ? 'Update your public identity' : 'Edit public profile' }}
        </p>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-6">
        <!-- ========== SECTION: Identity ========== -->
        <div class="space-y-4">
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Identity
          </p>

          <!-- Username (Display Name) -->
          <BaseFormfield label="Display name" :error="errors.username">
            <BaseInput
              v-model="form.username"
              :invalid="!!errors.username"
              placeholder="Your display name"
            />
            <template #help>
              <span class="text-xs text-slate-400">Used in mentions and profile URL</span>
            </template>
          </BaseFormfield>

          <!-- Salutation -->
          <BaseFormfield label="Salutation" :error="errors.salutation">
            <BaseInput
              v-model="form.salutation"
              :invalid="!!errors.salutation"
              placeholder="e.g. Dr."
              maxlength="48"
            />
            <template #help>
              <span class="text-xs text-slate-400">Shown before your name (e.g. Dr., Mx., Prof.)</span>
            </template>
          </BaseFormfield>
        </div>

        <!-- ========== SECTION: Appearance ========== -->
        <div class="space-y-3 pt-2">
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Appearance
          </p>

          <!-- Compact Avatar Row -->
          <div class="flex items-center gap-3">
            <UserAvatar
              v-if="avatarPreview"
              :src="avatarPreview"
              class="w-12 h-12 rounded-full object-cover ring-1 ring-slate-200"
            />
            <UserAvatar v-else class="w-12 h-12 rounded-full object-cover ring-1 ring-slate-200" />

            <div class="flex-1">
              <UploadDropZone accept="image/*" @selected="onAvatarSelected">
                <button
                  type="button"
                  class="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  :disabled="uploadingAvatar"
                >
                  {{ uploadingAvatar ? 'Uploading...' : 'Change profile photo' }}
                </button>
              </UploadDropZone>
              <p class="text-xs text-slate-400 mt-0.5">JPG, PNG, or GIF</p>
            </div>
          </div>
        </div>

        <!-- ========== SECTION: Admin Controls (when editing other users) ========== -->
        <div v-if="canEditAdminFields" class="pt-4 border-t border-slate-100 space-y-4">
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">
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
        <BaseButton
          variant="primary"
          size="sm"
          :disabled="saving || !hasChanges"
          @click="handleSave"
        >
          {{ saving ? 'Saving...' : 'Save changes' }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
