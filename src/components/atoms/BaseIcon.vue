<!--„Wrapper“ (Atom) für deine Icons aus der Heroicons-Bibliothek-->
<template>
  <!-- nimmt Größe IMMER, Farbe NUR wenn gesetzt -->
  <component :is="iconComponent" :class="[size, color]" aria-hidden="true" />
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import * as Icons from '@heroicons/vue/24/solid'

type Props = {
  name: string
  size?: string
  color?: string // optional: wenn nicht gesetzt, erbt das Icon die Farbe
}

const props = withDefaults(defineProps<Props>(), {
  size: 'w-5 h-5',
})

const iconComponent = computed(() => (Icons as Record<string, Component>)[props.name] || null)
</script>
