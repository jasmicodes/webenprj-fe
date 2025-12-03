<script setup lang="ts">
import PostCard from '@/components/organisms/PostCard.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseTextarea from '@/components/atoms/BaseTextarea.vue'
import BaseSelect from '@/components/atoms/BaseSelect.vue'
import BaseCard from '@/components/atoms/BaseCard.vue'
import BaseAvatar from '@/components/atoms/BaseAvatar.vue'
import BaseProgressRing from '@/components/atoms/BaseProgressRing.vue'
import BaseToast from '@/components/atoms/BaseToast.vue'
import BaseModal from '@/components/atoms/BaseModal.vue'
import BaseFormfield from '@/components/atoms/BaseFormfield.vue'
import BaseChip from '@/components/atoms/BaseChip.vue'
import FilePicker from '@/components/atoms/FilePicker.vue'
import BaseLabel from '@/components/atoms/BaseLabel.vue'
import TagSelect from '@/components/molecules/TagSelect.vue'

import { ref } from 'vue'
import { POSTS } from '@/data/posts'
defineOptions({ name: 'PlaygroundView' })

const selectedTag = ref('')
const demoTagOptions = [
  { label: 'All subjects', value: '' },
  { label: 'Math', value: 'math' },
  { label: 'Web Engineering', value: 'weben' },
  { label: 'Vue.js', value: 'vue' },
  { label: 'Fitness', value: 'fitness' },
]

const showModal = ref(false)
const pickedFile = ref<string | null>(null)

const posts = POSTS
</script>

<template>
  <main>
    <section class="p-6 text-center">
      <div class="content-shell">
        <PostCard v-for="p in posts" :key="p.id" :post="p" />
      </div>
    </section>

    <!-- Buttons -->
    <section>
      <h2 class="text-xl font-semibold mb-2">BaseButton</h2>
      <div class="flex flex-wrap gap-4">
        <BaseButton>Primary</BaseButton>
        <BaseButton variant="outline">Outline</BaseButton>
        <BaseButton variant="ghost">Ghost</BaseButton>
        <BaseButton variant="danger">Danger</BaseButton>
        <BaseButton size="sm">Small</BaseButton>
        <BaseButton size="lg">Large</BaseButton>
      </div>
    </section>

    <div class="mb-15"></div>

    <!-- Inputs -->
    <section>
      <h1>Atoms</h1>
      <h2>BaseInput / BaseTextarea / BaseSelect</h2>
      <div class="grid gap-4 max-w-md">
        <BaseInput placeholder="Type something..." />
        <BaseTextarea placeholder="Write a longer text..." />
        <BaseSelect>
          <option>Select Option</option>
          <option>Option A</option>
          <option>Option B</option>
        </BaseSelect>
      </div>
    </section>

    <!-- Cards -->
    <section>
      <h2 class="text-xl font-semibold mb-2">BaseCard</h2>
      <div class="flex flex-wrap gap-4">
        <BaseCard class="card-sm card-pad">Small Card</BaseCard>
        <BaseCard class="card-md card-pad">Medium Card</BaseCard>
        <BaseCard class="card-lg card-pad">Large Card</BaseCard>
      </div>
    </section>

    <!-- Avatar -->
    <section>
      <h2>BaseAvatar</h2>
      <div class="flex items-center gap-6">
        <BaseAvatar class=""> </BaseAvatar>
        <BaseAvatar class="avatar-md"> </BaseAvatar>
        <BaseAvatar class="avatar-lg"> </BaseAvatar>
      </div>
    </section>

    <!-- Progress Ring -->
    <section>
      <h2>BaseProgressRing</h2>
      <div class="flex gap-6 items-center">
        <BaseProgressRing :progress="25" />
        <BaseProgressRing :progress="50" />
        <BaseProgressRing :progress="75" />
        <BaseProgressRing :progress="100" />
      </div>
    </section>

    <!-- Toast -->
    <section>
      <h2>BaseToast (Example)</h2>
      <div class="flex flex-col gap-3 max-w-sm">
        <BaseToast type="success"> Profile saved successfully. </BaseToast>

        <BaseToast type="warning"> Please double check your input. </BaseToast>

        <BaseToast type="error"> Something went wrong. Try again. </BaseToast>
      </div>
    </section>

    <!-- Chips -->
    <section class="mt-8">
      <h2>BaseChip</h2>

      <div class="flex flex-wrap gap-2">
        <!-- Default (muted) -->
        <BaseChip>#general</BaseChip>

        <!-- explizit muted -->
        <BaseChip variant="muted">#draft</BaseChip>

        <!-- Tag-Variante -->
        <BaseChip variant="tag">#motivation</BaseChip>
        <BaseChip variant="tag">#webengineering</BaseChip>
      </div>
    </section>

    <section class="mt-12 max-w-md">
      <h2>BaseFormfield</h2>

      <BaseFormfield label="Username" help="Your public display name">
        <BaseInput placeholder="Enter username..." />
      </BaseFormfield>

      <BaseFormfield label="Bio (Textarea)">
        <BaseTextarea placeholder="Type something..." />
      </BaseFormfield>

      <BaseFormfield label="Select a country">
        <BaseSelect>
          <option>Austria</option>
          <option>Germany</option>
          <option>Switzerland</option>
        </BaseSelect>
      </BaseFormfield>

      <BaseFormfield label="Error Example" error="This field is required">
        <BaseInput />
      </BaseFormfield>
    </section>

    <section class="mt-12 max-w-md">
      <h2>FilePicker</h2>

      <FilePicker
        label="Upload an image"
        accept="image/*"
        @selected="(file) => (pickedFile = file.name)"
      />

      <p v-if="pickedFile" class="mt-2 text-sm text-primary-900">Selected: {{ pickedFile }}</p>
    </section>

    <section class="mt-12">
      <h2>BaseModal</h2>

      <BaseButton @click="showModal = true">Open Modal</BaseButton>

      <BaseModal v-model="showModal">
        <div class="card card-pad w-[300px]">
          <h3 class="text-lg font-semibold mb-4">Modal content</h3>

          <p class="mb-4">This is an example of BaseModal.</p>

          <BaseButton @click="showModal = false"> Close </BaseButton>
        </div>
      </BaseModal>
    </section>

    <section class="mt-12">
      <h2 class="text-xl font-semibold mb-2">TagSelect</h2>

      <div class="max-w-xs">
        <TagSelect v-model="selectedTag" :options="demoTagOptions" placeholder="Select a tag…" />
      </div>

      <p class="mt-3 text-neutral-700">
        Selected: <strong>{{ selectedTag || 'None' }}</strong>
      </p>
    </section>

    <section class="mt-12 max-w-md">
      <h2 class="text-xl font-semibold mb-2">BaseLabel</h2>

      <div class="flex flex-col gap-4">
        <div>
          <BaseLabel>Standard Label</BaseLabel>
          <BaseInput placeholder="Example Input…" />
        </div>

        <div>
          <BaseLabel>Email Address</BaseLabel>
          <BaseInput type="email" placeholder="email@example.com" />
        </div>

        <div>
          <BaseLabel>Password</BaseLabel>
          <BaseInput type="password" placeholder="••••••" />
        </div>
      </div>
    </section>
  </main>
</template>
