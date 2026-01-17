<script setup lang="ts">
defineOptions({ name: 'RegisterView' })

import { ref, computed } from 'vue'
import * as yup from 'yup'
import { isAxiosError } from 'axios'
import { useRouter } from 'vue-router'
import { api } from '@/services/api/client'
import { useToastStore } from '@/stores/toastStore'
import type { RegisterRequest, User } from '@/services/api/types'

import BaseFormfield from '@/components/atoms/BaseFormfield.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseSelect from '@/components/atoms/BaseSelect.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

import { COUNTRIES_DACH_FIRST } from '@/data/countries'
import {
  PASSWORD_REQUIREMENTS,
  createEmailSchema,
  createPasswordConfirmSchema,
  createPasswordSchema,
  createUsernameSchema,
} from '@/utils/validation'

import { useFormValidation } from '@/composables/useForm'

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
    //    { email, username, password, countryCode, profileImageUrl?, salutation? }
    //    Note: profileImageUrl is optional - omit it entirely if not provided
    const finalSalutation = salutation.value === 'other' ? otherText.value.trim() : salutation.value
    const apiPayload: RegisterRequest = {
      email: email.value.trim(),
      username: username.value.trim(),
      password: password.value,
      countryCode: country.value, // ⚠️ muss ein Code wie "AT" sein
      salutation: finalSalutation || undefined,
      // profileImageUrl omitted - optional field, not needed during registration
    }

    await api.post<User>('/users', apiPayload)

    // 3) Erfolg: Toast + Redirect zum Login
    toastStore.showSuccess('Account created successfully. You can now log in.')

    router.push({ name: 'login' })
  } catch (err: unknown) {
    // Backend-/Axios-Fehler
    let message = 'Registration failed'
    if (isAxiosError<{ message?: string }>(err) && err.response?.data?.message) {
      // aus Backend: { message: "Email is already in use." }
      message = err.response.data.message
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
  <main class="section flex items-center justify-center min-h-[80vh]">
    <!-- Wrapper -->
    <div
      class="w-full max-w-3xl grid gap-8 grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] md:items-center"
    >
      <!-- Logo -->
      <div class="hidden md:flex justify-center">
        <img
          src="@/assets/Weben - Logo Motivise.svg"
          alt="logo"
          class="w-44 h-44 lg:w-56 lg:h-56 rounded-2xl"
        />
      </div>

      <!-- Register-Card -->
      <form class="card card-pad space-y-4 w-full max-w-md mx-auto" @submit.prevent="submit">
        <h2>Create account</h2>

        <!-- Salutation -->
        <BaseFormfield
          label="Salutation"
          :error="errors.salutation"
          v-slot="{ id, describedBy, invalid }"
        >
          <BaseSelect
            :id="id"
            v-model="salutation"
            :invalid="invalid"
            :aria-invalid="invalid"
            :aria-describedby="describedBy"
            autocomplete="honorific-prefix"
          >
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
          v-slot="{ id, describedBy, invalid }"
        >
          <BaseInput
            :id="id"
            v-model="otherText"
            :invalid="invalid"
            :aria-invalid="invalid"
            :aria-describedby="describedBy"
            placeholder="e.g., Rev., Sir, Capt."
            maxlength="30"
            autocomplete="honorific-prefix"
          />
        </BaseFormfield>

        <!-- Email -->
        <BaseFormfield label="Email" :error="errors.email" v-slot="{ id, describedBy, invalid }">
          <BaseInput
            :id="id"
            v-model="email"
            type="email"
            :invalid="invalid"
            :aria-invalid="invalid"
            :aria-describedby="describedBy"
            placeholder="Email address"
            autocomplete="email"
            inputmode="email"
          />
        </BaseFormfield>

        <!-- Username -->
        <BaseFormfield
          label="Username"
          :error="errors.username"
          v-slot="{ id, describedBy, invalid }"
        >
          <BaseInput
            :id="id"
            v-model="username"
            :invalid="invalid"
            :aria-invalid="invalid"
            :aria-describedby="describedBy"
            placeholder="Username"
            autocomplete="username"
          />
        </BaseFormfield>

        <!-- Password -->
        <BaseFormfield
          label="Password"
          :error="errors.password"
          :help="PASSWORD_REQUIREMENTS"
          v-slot="{ id, describedBy, invalid }"
        >
          <!-- Falls BaseInput bereits type unterstützt; sonst deinen FormInput nutzen -->
          <BaseInput
            :id="id"
            v-model="password"
            type="password"
            :invalid="invalid"
            :aria-invalid="invalid"
            :aria-describedby="describedBy"
            placeholder="Password"
            autocomplete="new-password"
          />
        </BaseFormfield>

        <!-- Repeat Password -->
        <BaseFormfield
          label="Repeat password"
          :error="errors.repeatPw"
          v-slot="{ id, describedBy, invalid }"
        >
          <BaseInput
            :id="id"
            v-model="repeatPw"
            type="password"
            :invalid="invalid"
            :aria-invalid="invalid"
            :aria-describedby="describedBy"
            placeholder="Confirm Password"
            autocomplete="new-password"
          />
        </BaseFormfield>

        <!-- Country -->
        <BaseFormfield
          label="Country"
          :error="errors.country"
          v-slot="{ id, describedBy, invalid }"
        >
          <BaseSelect
            :id="id"
            v-model="country"
            :invalid="invalid"
            :aria-invalid="invalid"
            :aria-describedby="describedBy"
            autocomplete="country"
          >
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
