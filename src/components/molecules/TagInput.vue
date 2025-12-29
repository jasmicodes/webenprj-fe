<!-- TagInput - Free-form tag input with suggestions -->
<script setup lang="ts">
defineOptions({ name: 'TagInput' })

import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import { normalizeTagName, formatTagDisplay, isValidTag } from '@/utils/tagUtils'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    suggestions?: string[]
    maxLength?: number
  }>(),
  {
    placeholder: 'Add a tag (optional)',
    suggestions: () => [
      'webengineering',
      'statistics',
      'bwl',
      'design',
      'programming',
      'algorithms',
      'databases',
      'networking',
    ],
    maxLength: 30,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputValue = ref('')
const showSuggestions = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const dropdownRef = ref<HTMLDivElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

// Dropdown positioning for Teleport
const dropdownStyle = ref<Record<string, string>>({})

function updateDropdownPosition() {
  if (!inputRef.value || !showSuggestions.value) return

  const rect = inputRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '9999',
  }
}

watch(showSuggestions, async (show) => {
  if (show) {
    await nextTick()
    updateDropdownPosition()
  }
})

// Filter suggestions based on input
const filteredSuggestions = computed(() => {
  if (!inputValue.value.trim()) {
    return props.suggestions.slice(0, 6) // Show top 6 when empty
  }

  const query = normalizeTagName(inputValue.value).toLowerCase()
  return props.suggestions
    .filter((tag) => normalizeTagName(tag).toLowerCase().includes(query))
    .slice(0, 6)
})

// Check if input is valid per backend pattern
const isValidTagInput = computed(() => {
  if (!inputValue.value.trim()) return true // Empty is valid (optional)
  const normalized = normalizeTagName(inputValue.value)
  return isValidTag(normalized)
})

const errorMessage = computed(() => {
  if (!inputValue.value.trim() || isValidTagInput.value) return ''

  const normalized = normalizeTagName(inputValue.value)
  if (normalized.length < 2) return 'Tag must be at least 2 characters'
  if (normalized.length > 30) return 'Tag must be 30 characters or less'
  return 'Tag can only contain letters, numbers, spaces, dashes, and underscores'
})

function onFocus() {
  showSuggestions.value = true
}

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  inputValue.value = target.value
}

function selectTag(tag: string) {
  // Normalize and store the raw tag name (without '#')
  const normalized = normalizeTagName(tag)
  inputValue.value = formatTagDisplay(normalized) // Display with '#'
  emit('update:modelValue', normalized) // Emit normalized value
  showSuggestions.value = false
  inputRef.value?.blur()
}

function onEnter() {
  if (isValidTagInput.value && inputValue.value.trim()) {
    const normalized = normalizeTagName(inputValue.value)
    inputValue.value = formatTagDisplay(normalized) // Display with '#'
    emit('update:modelValue', normalized) // Emit normalized value
    showSuggestions.value = false
    inputRef.value?.blur()
  }
}

function clearTag() {
  inputValue.value = ''
  emit('update:modelValue', '')
  inputRef.value?.focus()
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node
  const isInsideContainer = containerRef.value?.contains(target)
  const isInsideDropdown = dropdownRef.value?.contains(target)

  if (!isInsideContainer && !isInsideDropdown) {
    showSuggestions.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', updateDropdownPosition, true)
  window.addEventListener('resize', updateDropdownPosition)
  if (props.modelValue) {
    // Display with '#' prefix
    inputValue.value = formatTagDisplay(props.modelValue)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('resize', updateDropdownPosition)
})

// Watch for external changes
const hasTag = computed(() => props.modelValue && props.modelValue.trim().length > 0)
</script>

<template>
  <div ref="containerRef" class="tag-input-container">
    <!-- Input with chip preview -->
    <div class="relative">
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        :placeholder="placeholder"
        :maxlength="maxLength"
        class="tag-input-field"
        :class="[
          errorMessage ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100',
          hasTag && 'pr-8'
        ]"
        @focus="onFocus"
        @input="onInput"
        @keydown.enter.prevent="onEnter"
        @keydown.esc="showSuggestions = false"
      />

      <!-- Clear button (when tag selected) -->
      <button
        v-if="hasTag"
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
        @click="clearTag"
      >
        <BaseIcon name="XMarkIcon" class="w-4 h-4" />
      </button>
    </div>

    <!-- Error message -->
    <p v-if="errorMessage" class="mt-1 text-xs text-red-600">{{ errorMessage }}</p>

    <!-- Suggestions dropdown (Teleported to body to avoid clipping) -->
    <Teleport to="body">
      <div
        v-if="showSuggestions && filteredSuggestions.length > 0"
        ref="dropdownRef"
        class="tag-dropdown"
        :style="dropdownStyle"
      >
        <button
          v-for="tag in filteredSuggestions"
          :key="tag"
          type="button"
          class="tag-dropdown-item"
          @click="selectTag(tag)"
        >
          <span>{{ formatTagDisplay(tag) }}</span>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.tag-input-container {
  position: relative;
}

.tag-input-field {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: theme('colors.slate.800');
  background: white;
  border: 1px solid;
  border-radius: 0.5rem;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.tag-input-field::placeholder {
  color: theme('colors.slate.400');
}
</style>

<style>
/* Dropdown styles - not scoped so they work with Teleport */
.tag-dropdown {
  background: white;
  border: 1px solid theme('colors.slate.200');
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  max-height: 12rem;
  overflow-y: auto;
}

.tag-dropdown-item {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  text-align: left;
  color: theme('colors.slate.700');
  transition: background-color 0.1s ease;
}

.tag-dropdown-item:first-child {
  border-radius: 0.75rem 0.75rem 0 0;
}

.tag-dropdown-item:last-child {
  border-radius: 0 0 0.75rem 0.75rem;
}

.tag-dropdown-item:hover {
  background: theme('colors.slate.50');
}
</style>
