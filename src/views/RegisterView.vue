<script setup lang="ts">
import { ref, computed } from 'vue'
import * as yup from 'yup'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { authApi } from '@/services/api'

import BaseFormfield from '@/components/atoms/BaseFormfield.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseSelect from '@/components/atoms/BaseSelect.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ToastMessage from '@/components/molecules/ToastMessage.vue'
import { COUNTRIES_DACH_FIRST } from '@/utils/countries.ts' // siehe Datei unten

const router = useRouter()

// form state
const salutation = ref<'Mr.' | 'Mrs.' | 'Ms.' | 'Mx.' | 'Dr.' | 'Prof.' | 'other' | ''>('')
const otherText = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const repeatPw = ref('')
const country = ref('') // später Countrycode

const loading = ref(false)
const toast = ref<{
  show: boolean
  msg: string
  variant: 'error' | 'success'
}>({
  show: false,
  msg: '',
  variant: 'error',
})

// Fehlermeldungen aus yup in ein Record mappen
const errors = ref<Record<string, string>>({})

// starkes Passwort (>=12, Groß/Klein, Zahl, Symbol)
const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{12,}$/

const schema = yup.object({
  salutation: yup
    .string()
    .oneOf(['Mr.', 'Mrs.', 'Ms.', 'Mx.', 'Dr.', 'Prof.', 'other'])
    .required('Please select a salutation'),
  otherText: yup
    .string()
    .max(30, 'Max. 30 characters')
    .when('salutation', ([sal]) =>
      sal === 'other' ? yup.string().required('Please specify') : yup.string().notRequired(),
    ),
  email: yup.string().email('Invalid email').required('Email required'),
  username: yup.string().required('Username required'),
  password: yup
    .string()
    .matches(strongPw, 'Min. 12 chars incl. upper, lower, number & symbol')
    .required('Password required'),
  repeatPw: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please repeat the password'),
  country: yup.string().required('Please select a country'),
})

const showOther = computed(() => salutation.value === 'other')

// Helper: Yup-Fehler mappen
function mapYupErrors(err: yup.ValidationError) {
  const map: Record<string, string> = {}
  err.inner.forEach((e) => {
    if (e.path && !map[e.path]) {
      map[e.path] = e.message
    }
  })
  return map
}

async function submit() {
  try {
    loading.value = true
    errors.value = {}
    toast.value.show = false

    // 1) Daten für Yup-Validation
    const validationPayload = {
      salutation: salutation.value,
      otherText: otherText.value,
      email: email.value,
      username: username.value,
      password: password.value,
      repeatPw: repeatPw.value,
      country: country.value,
    }

    await schema.validate(validationPayload, { abortEarly: false })

    // 2) Payload fürs Backend (/users)
    //    Backend erwartet:
    //    { email, username, password, countryCode, profileImageUrl }
    const apiPayload = {
      email: email.value.trim(),
      username: username.value.trim(),
      password: password.value,
      countryCode: country.value, // ⚠️ muss ein Code wie "AT" sein
      profileImageUrl: undefined as string | undefined,
    }

    await authApi.register(apiPayload)

    // 3) Erfolg: Toast + Redirect zum Login
    toast.value = {
      show: true,
      msg: 'Account created successfully. You can now log in.',
      variant: 'success',
    }

    router.push({ name: 'login' })
  } catch (err: any) {
    // a) Yup-Validierungsfehler
    if (err && err.name === 'ValidationError') {
      errors.value = mapYupErrors(err)
      toast.value = {
        show: true,
        msg: 'Please fix the highlighted fields',
        variant: 'error',
      }
      return
    }

    // b) Backend-/Axios-Fehler
    let message = 'Registration failed'
    if (err?.response?.data?.message) {
      // aus Backend: { message: "Email is already in use." }
      message = err.response.data.message
    } else if (err instanceof Error && err.message) {
      message = err.message
    }

    toast.value = { show: true, msg: message, variant: 'error' }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="section flex justify-center">
    <div class="mx-auto max-w-xl grid grid-cols-[200px_1fr] items-center gap-8">
      <img src="/IconMotivise.svg" alt="logo" class="w-40 h-40 rounded-2xl" />
      <form class="card card-pad space-y-3" @submit.prevent="submit">
        <h2>Create account</h2>

        <!-- Salutation -->
        <BaseFormfield label="Salutation" :error="errors.salutation">
          <BaseSelect v-model="salutation" :invalid="!!errors.salutation">
            <option value="" disabled selected>Select…</option>
            <option value="Mr.">Mr.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Ms.">Ms.</option>
            <option value="Mx.">Mx.</option>
            <option value="Dr.">Dr.</option>
            <option value="Prof.">Prof.</option>
            <option value="other">other</option>
          </BaseSelect>
        </BaseFormfield>

        <!-- Salutation 'other' details -->
        <BaseFormfield
          v-if="showOther"
          label="Please specify"
          :error="errors.otherText"
          help="Max. 30 characters"
        >
          <BaseInput
            v-model="otherText"
            :invalid="!!errors.otherText"
            placeholder="e.g., Rev., Sir, Capt."
          />
        </BaseFormfield>

        <!-- Email -->
        <BaseFormfield label="Email" :error="errors.email">
          <BaseInput v-model="email" :invalid="!!errors.email" placeholder="Email address" />
        </BaseFormfield>

        <!-- Username -->
        <BaseFormfield label="Username" :error="errors.username">
          <BaseInput v-model="username" :invalid="!!errors.username" placeholder="Username" />
        </BaseFormfield>

        <!-- Password -->
        <BaseFormfield
          label="Password"
          :error="errors.password"
          help="Min. 12 chars incl. upper, lower, number & symbol"
        >
          <!-- Falls BaseInput bereits type unterstützt; sonst deinen FormInput nutzen -->
          <BaseInput
            v-model="password"
            :invalid="!!errors.password"
            placeholder="••••••••••••"
            type="password"
          />
        </BaseFormfield>

        <!-- Repeat Password -->
        <BaseFormfield label="Repeat password" :error="errors.repeatPw">
          <BaseInput
            v-model="repeatPw"
            :invalid="!!errors.repeatPw"
            placeholder="••••••••••••"
            type="password"
          />
        </BaseFormfield>

        <!-- Country -->
        <BaseFormfield label="Country" :error="errors.country">
          <BaseSelect v-model="country" :invalid="!!errors.country">
            <option value="" disabled selected>Select country…</option>
            <option v-for="c in COUNTRIES_DACH_FIRST" :key="c" :value="c">
              {{ c }}
            </option>
          </BaseSelect>
        </BaseFormfield>

        <BaseButton class="w-full" :disabled="loading" @click="submit">
          {{ loading ? 'Creating…' : 'Register' }}
        </BaseButton>

        <small class="block text-center">
          Already have an account?
          <RouterLink :to="{ name: 'login' }" class="underline">Login</RouterLink>
        </small>
      </form>
    </div>
  </main>

  <ToastMessage
    v-if="toast.show"
    :message="toast.msg"
    :variant="toast.variant"
    @close="toast.show = false"
  />
</template>
