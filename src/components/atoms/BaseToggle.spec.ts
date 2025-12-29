import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseToggle from './BaseToggle.vue'

describe('BaseToggle', () => {
  describe('rendering', () => {
    it('should render as a button element', () => {
      const wrapper = mount(BaseToggle, {
        props: {
          modelValue: false,
        },
      })

      expect(wrapper.element.tagName).toBe('BUTTON')
    })

    it('should have role="switch"', () => {
      const wrapper = mount(BaseToggle, {
        props: {
          modelValue: false,
        },
      })

      expect(wrapper.attributes('role')).toBe('switch')
    })

    it('should have type="button"', () => {
      const wrapper = mount(BaseToggle, {
        props: {
          modelValue: false,
        },
      })

      expect(wrapper.attributes('type')).toBe('button')
    })

    it('should have base-toggle class', () => {
      const wrapper = mount(BaseToggle, {
        props: {
          modelValue: false,
        },
      })

      expect(wrapper.classes()).toContain('base-toggle')
    })
  })

  describe('states', () => {
    it('should have off state class when modelValue is false', () => {
      const wrapper = mount(BaseToggle, {
        props: {
          modelValue: false,
        },
      })

      expect(wrapper.classes()).toContain('base-toggle--off')
      expect(wrapper.classes()).not.toContain('base-toggle--on')
    })

    it('should have on state class when modelValue is true', () => {
      const wrapper = mount(BaseToggle, {
        props: {
          modelValue: true,
        },
      })

      expect(wrapper.classes()).toContain('base-toggle--on')
      expect(wrapper.classes()).not.toContain('base-toggle--off')
    })

    it('should have disabled state class when disabled', () => {
      const wrapper = mount(BaseToggle, {
        props: {
          modelValue: false,
          disabled: true,
        },
      })

      expect(wrapper.classes()).toContain('base-toggle--disabled')
      expect(wrapper.attributes('disabled')).toBeDefined()
    })
  })

  describe('accessibility', () => {
    it('should set aria-checked to false when off', () => {
      const wrapper = mount(BaseToggle, {
        props: {
          modelValue: false,
        },
      })

      expect(wrapper.attributes('aria-checked')).toBe('false')
    })

    it('should set aria-checked to true when on', () => {
      const wrapper = mount(BaseToggle, {
        props: {
          modelValue: true,
        },
      })

      expect(wrapper.attributes('aria-checked')).toBe('true')
    })

    it('should set aria-label when label prop provided', () => {
      const wrapper = mount(BaseToggle, {
        props: {
          modelValue: false,
          label: 'Toggle dark mode',
        },
      })

      expect(wrapper.attributes('aria-label')).toBe('Toggle dark mode')
    })
  })

  describe('events', () => {
    it('should emit update:modelValue with true when clicked while off', async () => {
      const wrapper = mount(BaseToggle, {
        props: {
          modelValue: false,
        },
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([true])
    })

    it('should emit update:modelValue with false when clicked while on', async () => {
      const wrapper = mount(BaseToggle, {
        props: {
          modelValue: true,
        },
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
    })

    it('should emit on each click', async () => {
      const wrapper = mount(BaseToggle, {
        props: {
          modelValue: false,
        },
      })

      await wrapper.trigger('click')
      await wrapper.trigger('click')
      await wrapper.trigger('click')

      expect(wrapper.emitted('update:modelValue')).toHaveLength(3)
    })
  })

  describe('structure', () => {
    it('should have track element', () => {
      const wrapper = mount(BaseToggle, {
        props: {
          modelValue: false,
        },
      })

      expect(wrapper.find('.base-toggle__track').exists()).toBe(true)
    })

    it('should have thumb element inside track', () => {
      const wrapper = mount(BaseToggle, {
        props: {
          modelValue: false,
        },
      })

      expect(wrapper.find('.base-toggle__track .base-toggle__thumb').exists()).toBe(true)
    })
  })
})
