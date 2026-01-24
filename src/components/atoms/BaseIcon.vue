<!--
  BaseIcon - Heroicons wrapper with size/color props.
  Use "NameIcon" for solid, "NameOutlineIcon" for outline variants.
  Example: name="HeartIcon" (solid) or name="HeartOutlineIcon"
-->
<template>
  <!-- nimmt Größe IMMER, Farbe NUR wenn gesetzt -->
  <component :is="iconComponent" :class="[size, color]" aria-hidden="true" />
</template>

<script setup lang="ts">
defineOptions({ name: 'BaseIcon' })

import { computed, type Component } from 'vue'
import * as SolidIcons from '@heroicons/vue/24/solid'
import * as OutlineIcons from '@heroicons/vue/24/outline'

type Props = {
  name: string
  size?: string
  color?: string // optional: wenn nicht gesetzt, erbt das Icon die Farbe
}

const props = withDefaults(defineProps<Props>(), {
  size: 'w-5 h-5',
})

// Merge solid and outline icons
// Outline icons get an "Outline" suffix (e.g., HeartOutline)
// Solid icons use their default name (e.g., HeartIcon)
const allIcons: Record<string, Component> = {
  ...SolidIcons,
}

// Add outline icons with "Outline" suffix
Object.entries(OutlineIcons).forEach(([name, component]) => {
  const outlineName = name.replace('Icon', 'OutlineIcon')
  allIcons[outlineName] = component as Component
})

const iconComponent = computed(() => allIcons[props.name] || null)
</script>
