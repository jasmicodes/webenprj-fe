<script setup lang="ts">
import PostCard from '@/components/organisms/PostCard.vue'
import avatar1 from '@/assets/user1.avif'
import sampleImg from '@/assets/PostPicture1.png'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseTextarea from '@/components/atoms/BaseTextarea.vue'
import BaseSelect from '@/components/atoms/BaseSelect.vue'
import BaseCard from '@/components/atoms/BaseCard.vue'
import BaseAvatar from '@/components/atoms/BaseAvatar.vue'
import BaseProgressRing from '@/components/atoms/BaseProgressRing.vue'
import BaseToast from '@/components/atoms/BaseToast.vue'
import BaseDivider from '@/components/atoms/BaseDivider.vue'
import BaseModal from '@/components/atoms/BaseModal.vue'
import BaseFormfield from '@/components/atoms/BaseFormfield.vue'

const posts = [
  {
    id: 1,
    user: { name: 'mariasantos', avatar: avatar1 },
    tag: 'webengineering',
    time: '2d',
    text: 'Today I finally understood async/await…',
    image: sampleImg,
    likes: 12,
    comments: 3,
    streak: 25,
  },
]
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

    <!-- Inputs -->
    <section>
      <h2 class="text-xl font-semibold mb-2">BaseInput / BaseTextarea / BaseSelect</h2>
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
      <h2 class="text-xl font-semibold mb-2">BaseAvatar</h2>
      <div class="flex items-center gap-6">
        <BaseAvatar class="avatar-sm"> </BaseAvatar>
        <BaseAvatar class="avatar-md"> </BaseAvatar>
        <BaseAvatar class="avatar-lg"> </BaseAvatar>
      </div>
    </section>

    <!-- Progress Ring -->
    <section>
      <h2 class="text-xl font-semibold mb-2">BaseProgressRing</h2>
      <div class="flex gap-6 items-center">
        <BaseProgressRing :progress="25" />
        <BaseProgressRing :progress="50" />
        <BaseProgressRing :progress="75" />
        <BaseProgressRing :progress="100" />
      </div>
    </section>

    <!-- Toast -->
    <section>
      <h2 class="text-xl font-semibold mb-2">BaseToast (Example)</h2>
      <BaseFormfield />
    </section>

    <section>
      <h2 class="text-xl font-semibold mb-2">BaseToast (Example)</h2>
      <BaseFormfield />
    </section>
  </main>
</template>
