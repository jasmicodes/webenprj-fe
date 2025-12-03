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
  <!-- Äußerer Bereich: zentriert & responsiv -->
  <main class="section flex justify-center">
    <div class="mx-auto max-w-xl grid grid-cols-[200px_1fr] items-center gap-8">
      <img src="/IconMotivise.svg" alt="logo" class="w-40 h-40 rounded-2xl" />

      <form class="card card-pad space-y-3" @submit.prevent="onSubmit">
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
