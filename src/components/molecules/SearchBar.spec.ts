import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from './SearchBar.vue'

// Mock child components
vi.mock('@/components/atoms/BaseInput.vue', () => ({
  default: {
    name: 'BaseInput',
    props: ['modelValue', 'placeholder'],
    emits: ['update:modelValue'],
    template: `
      <input
        class="mock-input"
        :value="modelValue"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    `,
  },
}))

vi.mock('@/components/atoms/BaseButton.vue', () => ({
  default: {
    name: 'BaseButton',
    props: ['variant'],
    template: '<button class="mock-button"><slot /></button>',
  },
}))

describe('SearchBar', () => {
  describe('rendering', () => {
    it('should render input and button', () => {
      const wrapper = mount(SearchBar)

      expect(wrapper.find('.mock-input').exists()).toBe(true)
      expect(wrapper.find('.mock-button').exists()).toBe(true)
    })

    it('should have search placeholder on input', () => {
      const wrapper = mount(SearchBar)

      expect(wrapper.find('.mock-input').attributes('placeholder')).toBe('Search')
    })

    it('should have Search text on button', () => {
      const wrapper = mount(SearchBar)

      expect(wrapper.find('.mock-button').text()).toBe('Search')
    })

    it('should have flex layout', () => {
      const wrapper = mount(SearchBar)

      expect(wrapper.classes()).toContain('flex')
      expect(wrapper.classes()).toContain('items-center')
    })
  })

  describe('search functionality', () => {
    it('should emit search event with term when button clicked', async () => {
      const wrapper = mount(SearchBar)

      const input = wrapper.find('.mock-input')
      await input.setValue('test query')

      await wrapper.find('.mock-button').trigger('click')

      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')![0]).toEqual(['test query'])
    })

    it('should emit empty string when searching without input', async () => {
      const wrapper = mount(SearchBar)

      await wrapper.find('.mock-button').trigger('click')

      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')![0]).toEqual([''])
    })

    it('should update term when typing in input', async () => {
      const wrapper = mount(SearchBar)

      const input = wrapper.find('.mock-input')
      await input.setValue('new search term')

      expect((input.element as HTMLInputElement).value).toBe('new search term')
    })
  })
})
