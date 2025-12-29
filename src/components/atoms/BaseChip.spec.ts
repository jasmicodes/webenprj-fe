import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseChip from './BaseChip.vue'

describe('BaseChip', () => {
  describe('rendering', () => {
    it('should render as a span element', () => {
      const wrapper = mount(BaseChip, {
        slots: {
          default: 'Chip text',
        },
      })

      expect(wrapper.element.tagName).toBe('SPAN')
    })

    it('should render slot content', () => {
      const wrapper = mount(BaseChip, {
        slots: {
          default: '#webdev',
        },
      })

      expect(wrapper.text()).toBe('#webdev')
    })

    it('should have chip base class', () => {
      const wrapper = mount(BaseChip)

      expect(wrapper.classes()).toContain('chip')
    })
  })

  describe('variants', () => {
    it('should apply muted variant by default', () => {
      const wrapper = mount(BaseChip)

      expect(wrapper.classes()).toContain('chip')
      expect(wrapper.classes()).toContain('chip-muted')
    })

    it('should apply muted variant when specified', () => {
      const wrapper = mount(BaseChip, {
        props: {
          variant: 'muted',
        },
      })

      expect(wrapper.classes()).toContain('chip-muted')
    })

    it('should apply tag variant when specified', () => {
      const wrapper = mount(BaseChip, {
        props: {
          variant: 'tag',
        },
      })

      expect(wrapper.classes()).toContain('tag')
      expect(wrapper.classes()).not.toContain('chip-muted')
    })
  })

  describe('with different content', () => {
    it('should render hashtag', () => {
      const wrapper = mount(BaseChip, {
        slots: {
          default: '#Mathe',
        },
      })

      expect(wrapper.text()).toBe('#Mathe')
    })

    it('should render status text', () => {
      const wrapper = mount(BaseChip, {
        slots: {
          default: 'Active',
        },
      })

      expect(wrapper.text()).toBe('Active')
    })

    it('should render HTML content in slot', () => {
      const wrapper = mount(BaseChip, {
        slots: {
          default: '<strong>Bold</strong> text',
        },
      })

      expect(wrapper.find('strong').exists()).toBe(true)
      expect(wrapper.text()).toContain('Bold')
    })
  })
})
