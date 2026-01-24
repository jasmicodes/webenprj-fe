<!--
  SearchBar - Simple input with search button.
  Emits 'search' with current term when clicked.
-->
<template>
  <div class="flex items-center gap-2">
    <BaseInput v-model="term" placeholder="Search" />
    <BaseButton variant="outline" @click="emit('search', term)">Search</BaseButton>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SearchBar' })

import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { ref } from 'vue'
const term = ref('')
const emit = defineEmits<{ search: [string] }>()
</script>
