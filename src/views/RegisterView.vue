<script setup lang="ts">
import { ref, computed } from 'vue'
import * as yup from 'yup'
import { AxiosError } from 'axios'
import { useRouter } from 'vue-router'
import { authApi } from '@/services/api/'
import { useToastStore } from '@/stores/toastStore'
import BaseFormfield from '@/components/atoms/BaseFormfield.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseSelect from '@/components/atoms/BaseSelect.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { COUNTRIES_DACH_FIRST } from '@/utils/countries.ts' // siehe Datei unten
import {
  PASSWORD_REQUIREMENTS,
  createEmailSchema,
  createPasswordConfirmSchema,
  createPasswordSchema,
  createUsernameSchema,
} from '@/utils/validation'
import { useFormValidation } from '@/composables/useFormValidation'

const router = useRouter()
const toastStore = useToastStore()

// form state
const salutation = ref<'Mr.' | 'Mrs.' | 'Ms.' | 'Mx.' | 'Dr.' | 'Prof.' | 'other' | ''>('')
const otherText = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const repeatPw = ref('')
const country = ref('') // später Countrycode

const loading = ref(false)

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
  email: createEmailSchema(),
  username: createUsernameSchema(),
  password: createPasswordSchema(),
  repeatPw: createPasswordConfirmSchema('password'),
  country: yup.string().required('Please select a country'),
})

const showOther = computed(() => salutation.value === 'other')
const { errors, validate, clearErrors } = useFormValidation(schema)

async function submit() {
  try {
    loading.value = true
    clearErrors()
    toastStore.clear()

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

    const isValid = await validate(validationPayload)
    if (!isValid) {
      toastStore.showError('Please fix the highlighted fields')
      return
    }

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
    toastStore.showSuccess('Account created successfully. You can now log in.')

    router.push({ name: 'login' })
  } catch (err: unknown) {
    // Backend-/Axios-Fehler
    const axiosErr = err as AxiosError<{ message?: string }>
    let message = 'Registration failed'
    if (axiosErr?.response?.data?.message) {
      // aus Backend: { message: "Email is already in use." }
      message = axiosErr.response.data.message
    } else if (err instanceof Error && err.message) {
      message = err.message
    }

    toastStore.showError(message)
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
          :help="PASSWORD_REQUIREMENTS"
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
            <option value="" disabled>Select country…</option>
            <option v-for="c in COUNTRIES_DACH_FIRST" :key="c.code" :value="c.code">
              {{ c.label }}
            </option>
          </BaseSelect>
        </BaseFormfield>

        <BaseButton class="w-full" :disabled="loading" type="submit">
          {{ loading ? 'Creating…' : 'Register' }}
        </BaseButton>

        <small class="block text-center">
          Already have an account?
          <RouterLink :to="{ name: 'login' }" class="underline">Login</RouterLink>
        </small>
      </form>
    </div>
  </main>

</template>
