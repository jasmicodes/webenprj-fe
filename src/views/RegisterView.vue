<script setup lang="ts">
import { ref, computed } from 'vue'
import * as yup from 'yup'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import BaseFormfield from '@/components/atoms/BaseFormfield.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseSelect from '@/components/atoms/BaseSelect.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ToastMessage from '@/components/molecules/ToastMessage.vue'
import { COUNTRIES_DACH_FIRST } from '@/utils/countries.ts' // siehe Datei unten

const router = useRouter()
const store = useUserStore()

// form state
const salutation = ref<'Mr.' | 'Mrs.' | 'Ms.' | 'Mx.' | 'Dr.' | 'Prof.' | 'other' | ''>('')
const otherText = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const repeatPw = ref('')
const country = ref('')

const loading = ref(false)
const toast = ref({ show: false, msg: '', variant: 'error' as const })

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

async function submit() {
  try {
    loading.value = true
    errors.value = {}

    const payload = {
      salutation: salutation.value || undefined,
      otherText: otherText.value || undefined,
      email: email.value,
      username: username.value,
      password: password.value,
      repeatPw: repeatPw.value,
      country: country.value,
    }

    await schema.validate(payload, { abortEarly: false })

    // Demo-Register → nutzt deinen Store
    await store.register({ username: username.value, email: email.value, password: password.value })
    router.push({ name: 'home' })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'inner' in err && Array.isArray(err.inner)) {
      // mehrere yup-Fehler
      const map: Record<string, string> = {}
      for (const e of err.inner) {
        if (e && typeof e === 'object' && 'path' in e && 'message' in e) {
          const path = String(e.path)
          const message = String(e.message)
          if (path && !map[path]) map[path] = message
        }
      }
      errors.value = map
      toast.value = { show: true, msg: 'Please fix the highlighted fields', variant: 'error' }
    } else {
      const message =
        err instanceof Error ? err.message : typeof err === 'string' ? err : 'Registration failed'
      toast.value = { show: true, msg: message, variant: 'error' }
    }
  } finally {
    loading.value = false
  }
}

const showOther = computed(() => salutation.value === 'other')
</script>

<template>
  <div class="mx-auto max-w-xl grid grid-cols-[200px_1fr] items-center gap-8">
    <img src="/IconMotivise.svg" alt="logo" class="w-40 h-40 rounded-2xl" />
    <div class="card card-pad space-y-3">
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
    </div>
  </div>

  <ToastMessage
    v-if="toast.show"
    :message="toast.msg"
    :variant="toast.variant"
    @close="toast.show = false"
  />
</template>
