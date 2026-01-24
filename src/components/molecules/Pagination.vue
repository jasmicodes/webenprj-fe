<template>
  <nav class="flex items-center justify-center gap-3" aria-label="Pagination">
    <BaseButton
      variant="ghost"
      size="sm"
      :disabled="disabled || currentPage <= 1"
      aria-label="Previous page"
      @click="goToPage(currentPage - 1)"
    >
      <BaseIcon name="ChevronLeftIcon" size="w-4 h-4" />
    </BaseButton>

    <span class="text-sm text-neutral-900">
      Page {{ currentPage }} of {{ totalPages }}
    </span>

    <BaseButton
      variant="ghost"
      size="sm"
      :disabled="disabled || currentPage >= totalPages"
      aria-label="Next page"
      @click="goToPage(currentPage + 1)"
    >
      <BaseIcon name="ChevronRightIcon" size="w-4 h-4" />
    </BaseButton>
  </nav>
</template>

<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'

defineOptions({ name: 'PaginationNav' })

interface Props {
  currentPage: number
  totalPages: number
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{ 'update:currentPage': [page: number] }>()

function goToPage(page: number) {
  emit('update:currentPage', page)
}
</script>
