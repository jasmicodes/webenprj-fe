<!-- Horizontal scrolling subject/tag filter tabs -->
<script setup lang="ts">
defineOptions({ name: 'SubjectTabs' })

export interface SubjectOption {
  label: string
  value: string
}

const props = withDefaults(
  defineProps<{
    subjects: SubjectOption[]
    modelValue: string
  }>(),
  {
    modelValue: '',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function selectSubject(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="subject-tabs-container overflow-x-auto scrollbar-hide -mx-1 px-1">
    <div class="flex gap-2 py-2">
      <button
        v-for="subject in subjects"
        :key="subject.value"
        type="button"
        class="subject-tab flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap"
        :class="
          modelValue === subject.value
            ? 'bg-blue-500 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        "
        @click="selectSubject(subject.value)"
      >
        {{ subject.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar but keep functionality */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
