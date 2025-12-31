<!-- src/views/SettingsView.vue -->
<script setup lang="ts">
defineOptions({ name: 'SettingsView' })

import { ref, computed } from 'vue'
import * as yup from 'yup'
import { useUserStore } from '@/stores/userStore'
import { useAppearanceStore, AVAILABLE_BACKGROUNDS } from '@/stores/uiStore'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useFormValidation } from '@/composables/useForm'
import { useToastStore } from '@/stores/toastStore'
import { usersApi } from '@/services/api/users'
import { getErrorMessage } from '@/services/api/client'

import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseCard from '@/components/atoms/BaseCard.vue'
import BaseFormfield from '@/components/atoms/BaseFormfield.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseToggle from '@/components/atoms/BaseToggle.vue'
import PageHeader from '@/components/atoms/PageHeader.vue'

// -------------------- STORES --------------------
const userStore = useUserStore()
const appearanceStore = useAppearanceStore()
const toast = useToastStore()

// Ambient mode detection
const isMobile = useMediaQuery('(max-width: 768px)')
const isAmbientMode = computed(() => appearanceStore.bgEnabled && !isMobile.value)

// -------------------- EMAIL FORM --------------------
const showChangeEmail = ref(false)
const savingEmail = ref(false)
const emailForm = ref({
  newEmail: '',
  confirmPassword: '',
})
const emailErrors = ref<{ newEmail?: string; confirmPassword?: string }>({})

const emailSchema = yup.object({
  newEmail: yup
    .string()
    .email('Please enter a valid email address')
    .required('New email is required'),
  confirmPassword: yup
    .string()
    .min(1, 'Password is required to change email')
    .required('Password is required to change email'),
})

async function saveEmail() {
  emailErrors.value = {}

  try {
    await emailSchema.validate(emailForm.value, { abortEarly: false })
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      err.inner.forEach((e) => {
        if (e.path) {
          emailErrors.value[e.path as keyof typeof emailErrors.value] = e.message
        }
      })
    }
    return
  }

  savingEmail.value = true

  try {
    const response = await usersApi.changeEmail({
      newEmail: emailForm.value.newEmail,
      currentPassword: emailForm.value.confirmPassword,
    })

    // Update user and token (no logout needed!)
    userStore.user = response.user
    if (response.credentialsChanged && response.token) {
      userStore.updateToken(response.token)
    }

    toast.showSuccess('Email updated successfully')
    showChangeEmail.value = false
    emailForm.value = { newEmail: '', confirmPassword: '' }
  } catch (err) {
    toast.showError(getErrorMessage(err))
  } finally {
    savingEmail.value = false
  }
}

function cancelEmailChange() {
  showChangeEmail.value = false
  emailForm.value = { newEmail: '', confirmPassword: '' }
  emailErrors.value = {}
}

// -------------------- PASSWORD FORM --------------------
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

    toast.showSuccess('Password changed successfully')
    showChangePassword.value = false
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      repeatPassword: '',
    }
  } catch (err) {
    toast.showError(getErrorMessage(err))
  } finally {
    savingPassword.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-start justify-center px-8">
    <div
      class="w-full max-w-3xl py-8 content-glass-container"
      :class="{ 'ambient-mode': isAmbientMode }"
    >
      <!-- Page Header -->
      <PageHeader title="Settings" subtitle="Account security and preferences" />

      <div class="space-y-6">
        <!-- ACCOUNT SECTION -->
        <BaseCard>
          <div class="space-y-4">
            <div>
              <h2 class="text-base font-semibold text-slate-900">Account</h2>
              <p class="text-sm text-slate-500 mt-0.5">Manage your account security</p>
            </div>

            <!-- Email Section -->
            <div class="border-t border-slate-100 pt-4">
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-900">Email address</p>
                  <p class="text-xs text-slate-500 mt-0.5 truncate">{{ userStore.user?.email }}</p>
                </div>
                <BaseButton
                  v-if="!showChangeEmail"
                  variant="outline"
                  size="sm"
                  @click="showChangeEmail = true"
                >
                  Change email
                </BaseButton>
                <BaseButton
                  v-else
                  variant="ghost"
                  size="sm"
                  @click="cancelEmailChange"
                >
                  Cancel
                </BaseButton>
              </div>

              <!-- Email Change Form (expandable) -->
              <div v-if="showChangeEmail" class="mt-4 pt-4 border-t border-slate-100 space-y-4 max-w-md">
                <p class="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  Changing your email affects how you sign in.
                </p>

                <BaseFormfield label="New email address" :error="emailErrors.newEmail">
                  <BaseInput
                    v-model="emailForm.newEmail"
                    type="email"
                    placeholder="Enter new email address"
                    :invalid="!!emailErrors.newEmail"
                  />
                </BaseFormfield>

                <BaseFormfield label="Confirm with password" :error="emailErrors.confirmPassword">
                  <BaseInput
                    v-model="emailForm.confirmPassword"
                    type="password"
                    placeholder="Enter your current password"
                    :invalid="!!emailErrors.confirmPassword"
                  />
                </BaseFormfield>

                <BaseButton variant="primary" size="sm" :disabled="savingEmail" @click="saveEmail">
                  {{ savingEmail ? 'Updating...' : 'Update email' }}
                </BaseButton>
              </div>
            </div>

            <!-- Change Password Toggle -->
            <div class="border-t border-slate-100 pt-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-900">Password</p>
                  <p class="text-xs text-slate-500 mt-0.5">Update your account password</p>
                </div>
                <BaseButton
                  variant="outline"
                  size="sm"
                  @click="showChangePassword = !showChangePassword"
                >
                  {{ showChangePassword ? 'Cancel' : 'Change password' }}
                </BaseButton>
              </div>

              <!-- Password Form (expandable) -->
              <div v-if="showChangePassword" class="mt-4 pt-4 border-t border-slate-100 space-y-4 max-w-md">
                <BaseFormfield label="Current password" :error="passwordErrors.currentPassword">
                  <BaseInput v-model="passwordForm.currentPassword" type="password" placeholder="Current password" />
                </BaseFormfield>

                <BaseFormfield label="New password" :error="passwordErrors.newPassword">
                  <BaseInput v-model="passwordForm.newPassword" type="password" placeholder="New password" />
                </BaseFormfield>

                <BaseFormfield label="Repeat new password" :error="passwordErrors.repeatPassword">
                  <BaseInput v-model="passwordForm.repeatPassword" type="password" placeholder="Repeat new password" />
                </BaseFormfield>

                <BaseButton variant="primary" size="sm" :disabled="savingPassword" @click="savePassword">
                  {{ savingPassword ? 'Saving...' : 'Update password' }}
                </BaseButton>
              </div>
            </div>

            <!-- Logout -->
            <div class="border-t border-slate-100 pt-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-900">Sign out</p>
                  <p class="text-xs text-slate-500 mt-0.5">Log out of your account on this device</p>
                </div>
                <BaseButton variant="ghost" size="sm" @click="userStore.logout()">
                  Logout
                </BaseButton>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- APPEARANCE SECTION -->
        <BaseCard class="glass-card">
          <div class="space-y-6">
            <div>
              <h2 class="text-base font-semibold text-slate-900">Appearance</h2>
              <p class="text-sm text-slate-500 mt-0.5">
                Customize your visual experience
              </p>
            </div>

            <!-- Background Toggle -->
            <div class="flex items-center justify-between py-3 border-t border-slate-100">
              <div class="flex-1">
                <label for="bg-toggle" class="text-sm font-medium text-slate-900 block">
                  Background image
                </label>
                <p class="text-xs text-slate-500 mt-0.5">
                  Enable a soft blurred background (disabled on mobile)
                </p>
              </div>
              <BaseToggle
                id="bg-toggle"
                :model-value="appearanceStore.bgEnabled"
                label="Toggle background image"
                @update:model-value="appearanceStore.setBgEnabled"
              />
            </div>

            <!-- Background Selector (only shown when enabled) -->
            <div
              v-if="appearanceStore.bgEnabled"
              class="border-t border-slate-100 pt-6"
            >
              <label class="text-sm font-medium text-slate-900 block mb-3">
                Select background
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label
                  v-for="bg in AVAILABLE_BACKGROUNDS"
                  :key="bg.id"
                  class="relative cursor-pointer group"
                  :aria-label="`Select ${bg.name} background`"
                >
                  <input
                    type="radio"
                    name="background-selection"
                    :value="bg.id"
                    :checked="appearanceStore.bgId === bg.id"
                    :aria-label="`${bg.name} background`"
                    class="sr-only"
                    @change="appearanceStore.setBgId(bg.id)"
                  />
                  <div
                    class="relative aspect-video rounded-xl overflow-hidden border-2 transition-all"
                    :class="
                      appearanceStore.bgId === bg.id
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-slate-200 hover:border-slate-300'
                    "
                    role="img"
                    :aria-label="`${bg.name} background preview`"
                  >
                    <!-- Preview with blur/overlay applied -->
                    <img
                      :src="bg.path"
                      :alt="`${bg.name} background preview`"
                      class="w-full h-full object-cover"
                      style="filter: blur(9px) saturate(1.15) brightness(1.0); transform: scale(1.06)"
                    />
                    <div
                      class="absolute inset-0 flex items-center justify-center"
                      style="background: rgba(248, 250, 252, 0.45)"
                    >
                      <span class="text-xs font-medium text-slate-700">
                        {{ bg.name }}
                      </span>
                    </div>
                    <!-- Selected indicator -->
                    <div
                      v-if="appearanceStore.bgId === bg.id"
                      class="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                    >
                      <svg
                        class="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <p class="text-xs text-slate-600 mt-2 text-center">{{ bg.name }}</p>
                </label>
              </div>
              <p class="text-xs text-slate-500 mt-4">
                Backgrounds are automatically blurred and softened to maintain focus on content
              </p>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
/**
 * Settings container
 * Clean mode: minimal styling
 * Ambient mode: premium glass panel
 */
.content-glass-container {
  background: transparent;
  border-radius: 24px;
  margin-top: 16px;
  margin-bottom: 16px;
  padding-left: 24px;
  padding-right: 24px;
}

/* Ambient mode: premium glass panel */
.content-glass-container.ambient-mode {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(10px) saturate(120%);
  -webkit-backdrop-filter: blur(10px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02);
}

/* Glass effect for appearance card */
.glass-card {
  background: rgba(255, 255, 255, 0.65) !important;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(10px)) {
  .content-glass-container.ambient-mode {
    background: rgba(255, 255, 255, 0.85);
  }
}

@supports not (backdrop-filter: blur(20px)) {
  .glass-card {
    background: rgba(255, 255, 255, 0.95) !important;
  }
}
</style>
