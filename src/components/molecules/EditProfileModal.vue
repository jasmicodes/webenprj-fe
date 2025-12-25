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
const avatarMarkedForRemoval = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

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
    avatarMarkedForRemoval.value ||
    (canEditAdminFields.value && form.value.role !== originalValues.value.role) ||
    (canEditAdminFields.value && form.value.active !== originalValues.value.active)
  )
})

// Show remove button only if there's a custom avatar to remove
const hasCustomAvatar = computed(() => {
  return (avatarPreview.value || form.value.profileImageUrl) && !avatarMarkedForRemoval.value
})

// Avatar alt text for accessibility
const avatarAltText = computed(() => {
  const name = form.value.username || props.user?.username || 'User'
  return `${name}'s profile photo`
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
  avatarMarkedForRemoval.value = false
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

// -------------------- AVATAR ACTIONS --------------------
function triggerFileInput() {
  fileInputRef.value?.click()
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Reset file input for re-selection of same file
  input.value = ''

  uploadingAvatar.value = true
  try {
    const media = await mediaApi.upload(file)
    form.value.profileImageUrl = `/medias/${media.id}`
    const blob = await mediaApi.retrieve(media.id)
    avatarPreview.value = URL.createObjectURL(blob)
    avatarMarkedForRemoval.value = false
  } catch (err) {
    toast.showError(getErrorMessage(err))
  } finally {
    uploadingAvatar.value = false
  }
}

function removeAvatar() {
  avatarPreview.value = null
  form.value.profileImageUrl = ''
  avatarMarkedForRemoval.value = true
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

    // Handle avatar removal first if marked
    if (avatarMarkedForRemoval.value && originalValues.value.profileImageUrl) {
      if (isEditingSelf.value) {
        await usersApi.removeAvatar()
      } else {
        await adminUsersApi.removeUserAvatar(props.user!.id)
      }
    }

    if (isEditingSelf.value) {
      // Self-edit: use regular user API
      const currentUser = userStore.user!

      const response = await usersApi.updateMyProfile({
        email: currentUser.email,
        username: form.value.username,
        countryCode: currentUser.countryCode,
        profileImageUrl: avatarMarkedForRemoval.value ? undefined : (form.value.profileImageUrl || undefined),
        salutation: form.value.salutation || undefined,
      })

      updatedUser = response.user

      // If credentials changed, update token
      if (response.credentialsChanged && response.token) {
        userStore.updateToken(response.token)
      }

      // Update local user store
      userStore.user = updatedUser
    } else {
      // Admin editing another user
      const targetUser = props.user!
      updatedUser = await adminUsersApi.updateUser(targetUser.id, {
        email: targetUser.email,
        username: form.value.username,
        countryCode: targetUser.countryCode,
        profileImageUrl: avatarMarkedForRemoval.value ? undefined : (form.value.profileImageUrl || undefined),
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
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
      <!-- Header (fixed) -->
      <div class="px-5 py-3 border-b border-slate-100 flex-shrink-0">
        <h2 class="text-base font-semibold text-slate-900">
          {{ isEditingSelf ? 'Edit Profile' : `Edit ${user?.username}` }}
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          {{ isEditingSelf ? 'Update your public identity' : 'Edit public profile' }}
        </p>
      </div>

      <!-- Body (scrollable) -->
      <div class="flex-1 overflow-y-auto px-5 py-4">
        <!-- Main content: 2-column on md+, stacked on mobile -->
        <div class="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-5">
          <!-- Left: Avatar section -->
          <div class="flex flex-col items-center md:items-start gap-2.5">
            <!-- Avatar with ring and subtle shadow -->
            <div class="relative">
              <UserAvatar
                v-if="avatarPreview && !avatarMarkedForRemoval"
                :src="avatarPreview"
                :alt="avatarAltText"
                class="w-20 h-20 rounded-full object-cover ring-2 ring-slate-100 shadow-sm"
              />
              <UserAvatar
                v-else
                :alt="avatarAltText"
                class="w-20 h-20 rounded-full object-cover ring-2 ring-slate-100 shadow-sm"
              />
              <!-- Upload spinner overlay -->
              <div
                v-if="uploadingAvatar"
                class="absolute inset-0 flex items-center justify-center bg-white/70 rounded-full"
              >
                <svg class="w-5 h-5 text-slate-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            </div>

            <!-- Hidden file input -->
            <input
              ref="fileInputRef"
              type="file"
              accept="image/jpeg,image/png,image/gif"
              class="sr-only"
              aria-label="Upload profile photo"
              @change="onFileSelected"
            />

            <!-- Action buttons -->
            <div class="flex flex-col items-center md:items-start gap-1.5">
              <!-- Change button -->
              <button
                type="button"
                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md
                       bg-slate-100 text-slate-700
                       hover:bg-slate-200 hover:text-slate-900
                       focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
                :disabled="uploadingAvatar"
                aria-label="Change profile photo"
                @click="triggerFileInput"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Change</span>
              </button>

              <!-- Remove button (only if has custom avatar) -->
              <button
                v-if="hasCustomAvatar"
                type="button"
                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md
                       border border-red-200 text-red-600 bg-white
                       hover:bg-red-50 hover:border-red-300 hover:text-red-700
                       focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
                :disabled="uploadingAvatar"
                aria-label="Remove profile photo"
                @click="removeAvatar"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Remove</span>
              </button>
            </div>

            <!-- Helper text -->
            <p class="text-[10px] text-slate-400 text-center md:text-left">
              JPG, PNG, or GIF
            </p>
          </div>

          <!-- Right: Identity fields -->
          <div class="space-y-3">
            <BaseFormfield label="Display name" :error="errors.username" compact>
              <BaseInput
                v-model="form.username"
                :invalid="!!errors.username"
                placeholder="Your display name"
                size="sm"
              />
              <template #help>
                <span class="text-[10px] text-slate-400">Used in mentions and profile URL</span>
              </template>
            </BaseFormfield>

            <BaseFormfield label="Salutation" :error="errors.salutation" compact>
              <BaseInput
                v-model="form.salutation"
                :invalid="!!errors.salutation"
                placeholder="e.g. Dr."
                maxlength="48"
                size="sm"
              />
              <template #help>
                <span class="text-[10px] text-slate-400">Shown before your name</span>
              </template>
            </BaseFormfield>
          </div>
        </div>

        <!-- Admin Controls (when editing other users) -->
        <div v-if="canEditAdminFields" class="mt-4 pt-3 border-t border-slate-100 space-y-3">
          <p class="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
            Admin
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BaseFormfield label="Role" :error="errors.role" compact>
              <BaseSelect v-model="form.role" :invalid="!!errors.role" size="sm">
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </BaseSelect>
            </BaseFormfield>

            <div class="flex items-center justify-between py-1.5 px-2 rounded-lg bg-slate-50">
              <div>
                <p class="text-xs font-medium text-slate-700">Active</p>
                <p class="text-[10px] text-slate-500">
                  {{ form.active ? 'Can access' : 'Blocked' }}
                </p>
              </div>
              <button
                type="button"
                class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                :class="form.active ? 'bg-emerald-500' : 'bg-slate-300'"
                @click="form.active = !form.active"
              >
                <span
                  class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
                  :class="form.active ? 'translate-x-5' : 'translate-x-0.5'"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer (sticky) -->
      <div class="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2 flex-shrink-0 bg-white rounded-b-2xl">
        <BaseButton variant="ghost" size="sm" :disabled="saving" @click="handleCancel">
          Cancel
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :disabled="saving || !hasChanges"
          @click="handleSave"
        >
          {{ saving ? 'Saving...' : 'Save' }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
