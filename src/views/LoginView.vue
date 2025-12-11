<script setup lang="ts">
import { ref } from 'vue'
import * as yup from 'yup'
import { AxiosError } from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useToastStore } from '@/stores/toastStore'
import { getErrorMessage } from '@/services/api/client'
import { useFormValidation } from '@/composables/useFormValidation'

import BaseFormfield from '@/components/atoms/BaseFormfield.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const store = useUserStore()
const toast = useToastStore()

// Form state
const identifier = ref('') //username or email
const password = ref('')
const loading = ref(false)

// Yup-Schema für Login (Frontend-Validation)
const loginSchema = yup.object({
  identifier: yup.string().required('Username or email is required'),
  password: yup.string().required('Password is required'),
})

const { errors, validate, clearErrors } = useFormValidation(loginSchema)

// Submit-Handler with real backend API
async function onSubmit() {
  loading.value = true
  clearErrors()
  toast.clear()

  try {
    // 1) Frontend-Validation
    const isValid = await validate({
      identifier: identifier.value.trim(),
      password: password.value,
    })
    if (!isValid) {
      toast.showError('Please fix the highlighted fields.')
      return
    }

    // 2) Real API login via backend
    await store.login({
      identifier: identifier.value.trim(),
      password: password.value,
    })

    // 3) Erfolg → Toast + Redirect
    toast.showSuccess('Login successful. Welcome back!')

    router.push({ name: 'home' })
  } catch (err: unknown) {
    // Login failed (API error)
    const status = (err as AxiosError)?.response?.status
    if (status === 401 || status === 403) {
      toast.showError('Invalid username/email or password.')
    } else {
      toast.showError(getErrorMessage(err))
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- Äußerer Bereich -->
  <main class="section flex items-center justify-center min-h-[80vh]">
    <!-- Wrapper -->
    <div
      class="w-full max-w-3xl grid gap-8 grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] md:items-center"
    >
      <!-- Logo -->
      <div class="flex justify-center md:justify-center order-1 md:order-none">
        <img
          src="@/assets/Weben - Logo Motivise.svg"
          alt="logo"
          class="w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-56 lg:h-56 rounded-2xl"
        />
      </div>

      <!-- Login Card -->
      <form
        class="card card-pad space-y-4 w-full max-w-sm mx-auto order-2 md:order-none"
        @submit.prevent="onSubmit"
      >
        <h2>Login</h2>

        <BaseFormfield label="Username or email" :error="errors.identifier">
          <BaseInput
            v-model="identifier"
            placeholder="Enter your username or email"
            :invalid="!!errors.identifier"
          />
        </BaseFormfield>

        <!-- Passwort -->
        <BaseFormfield label="Password" :error="errors.password">
          <BaseInput
            v-model="password"
            type="password"
            placeholder="Enter your password"
            :invalid="!!errors.password"
          />
        </BaseFormfield>

        <!-- Submit-Button -->
        <BaseButton type="submit" class="btn w-full btn-primary" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </BaseButton>

        <!-- Link zur Registrierung -->
        <p class="text-center text-sm text-neutral-700">
          Don’t have an account yet?
          <RouterLink
            :to="{ name: 'register' }"
            class="underline text-primary-400 hover:text-primary-900"
          >
            Sign up
          </RouterLink>
        </p>
      </form>
    </div>
  </main>
</template>
