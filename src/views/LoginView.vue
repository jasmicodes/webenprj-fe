<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

import BaseFormfield from '@/components/atoms/BaseFormfield.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ModalAlert from '@/components/molecules/ModalAlert.vue'

const router = useRouter()
const store = useUserStore()

// Form state
const identifier = ref('') //username or email
const password = ref('')

// Error modal state
const errorModal = ref({ show: false, title: 'Login error', message: '' })

async function submit() {
  try {
    if (!identifier.value || !password.value) throw new Error('Please fill in all fields')
    await store.login({ identifier: identifier.value, password: password.value })
    router.push({ name: 'home' })
  } catch (err: unknown) {
    let message = 'Login failed. Please try again.'

    if (err && typeof err === 'object') {
      if ('response' in err && err.response && typeof err.response === 'object' && 'data' in err.response) {
        const data = err.response.data
        if (data && typeof data === 'object' && 'message' in data) {
          message = String(data.message)
        }
      } else if (err instanceof Error) {
        message = err.message
      }
    }

    errorModal.value = {
      show: true,
      title: 'Login error',
      message,
    }
  }
}
</script>

<template>
  <div class="mx-auto max-w-xl grid grid-cols-[200px_1fr] items-center gap-8">
    <img src="/IconMotivise.svg" alt="logo" class="w-40 h-40 rounded-2xl" />

    <form class="card card-pad space-y-3" @submit.prevent="submit" novalidate>
      <h2>Login</h2>

      <BaseFormfield label="Username or Email">
        <BaseInput
          v-model="identifier"
          placeholder="username or email"
          name="identifier"
          autocomplete="username"
          required
        />
      </BaseFormfield>

      <BaseFormfield label="Password">
        <BaseInput
          v-model="password"
          type="password"
          placeholder="Password"
          name="password"
          autocomplete="current-password"
          required
        />
      </BaseFormfield>

      <BaseButton class="w-full" type="submit">Login</BaseButton>

      <small class="block text-center">
        No account? <RouterLink :to="{ name: 'register' }" class="underline">Register</RouterLink>
      </small>
    </form>
  </div>

  <ModalAlert
    v-model="errorModal.show"
    :title="errorModal.title"
    :message="errorModal.message"
    variant="error"
  />
</template>
