<script setup lang="ts">
import { ref } from 'vue'
import * as yup from 'yup'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useToastStore } from '@/stores/toastStore'
import { getErrorMessage } from '@/services/api/client'

import BaseFormfield from '@/components/atoms/BaseFormfield.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const store = useUserStore()
const toast = useToastStore()

// Form state
const identifier = ref('') //username or email
const password = ref('')

// Error modal state
const errors = ref<{ identifier?: string; password?: string }>({})

// Yup-Schema für Login (Frontend-Validation)
const loginSchema = yup.object({
  identifier: yup.string().required('Username or email is required'),
  password: yup.string().required('Password is required'),
})

// Hilfsfunktion: Yup-Fehler mappen
function mapYupErrors(err: yup.ValidationError) {
  const fieldErrors: Record<string, string> = {}
  err.inner.forEach((e) => {
    if (e.path && !fieldErrors[e.path]) {
      fieldErrors[e.path] = e.message
    }
  })
  return fieldErrors
}

// Submit-Handler with real backend API
async function onSubmit() {
  errors.value = {}
  toast.clear()

  try {
    // 1) Frontend-Validation
    await loginSchema.validate(
      {
        identifier: identifier.value.trim(),
        password: password.value,
      },
      { abortEarly: false },
    )

    // 2) Real API login via backend
    await store.login({
      identifier: identifier.value.trim(),
      password: password.value,
    })

    // 3) Erfolg → Toast + Redirect
    toast.showSuccess('Login successful. Welcome back!')

    router.push({ name: 'home' })
  } catch (err: any) {
    // a) Yup-Validierungsfehler
    if (err.name === 'ValidationError') {
      errors.value = mapYupErrors(err)
      toast.showError('Please fix the highlighted fields.')
      return
    }

    // b) Login failed (API error)
    const status = err?.response?.status
    if (status === 401 || status === 403) {
      toast.showError('Invalid username/email or password.')
    } else {
      toast.showError(getErrorMessage(err))
    }
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
        <BaseButton type="submit" class="btn w-full btn-primary"> Login </BaseButton>

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
