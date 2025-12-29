<!--Für Prozentanzeigen (z. B. Lernfortschritt, Study Streaks)-->
<template>
  <svg :width="size" :height="size" class="transform -rotate-90">
    <circle
      :r="radius"
      :cx="size / 2"
      :cy="size / 2"
      class="text-neutral-200"
      stroke="currentColor"
      stroke-width="4"
      fill="transparent"
    />
    <circle
      :r="radius"
      :cx="size / 2"
      :cy="size / 2"
      class="text-primary-400"
      stroke="currentColor"
      stroke-width="4"
      stroke-linecap="round"
      fill="transparent"
      :stroke-dasharray="circumference"
      :stroke-dashoffset="offset"
    />
  </svg>
</template>

<script setup lang="ts">
defineOptions({ name: 'BaseProgressRing' })

const props = withDefaults(defineProps<{ progress: number; size?: number }>(), {
  progress: 0,
  size: 48,
})

const radius = props.size / 2 - 4
const circumference = 2 * Math.PI * radius
const offset = circumference - (props.progress / 100) * circumference
</script>
