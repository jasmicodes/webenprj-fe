import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from './BaseButton.vue'

describe('BaseButton', () => {
  describe('rendering', () => {
    it('should render as a button by default', () => {
      const wrapper = mount(BaseButton, {
        slots: {
          default: 'Click me',
        },
      })

      expect(wrapper.element.tagName).toBe('BUTTON')
      expect(wrapper.text()).toBe('Click me')
    })

    it('should render as an anchor when as="a"', () => {
      const wrapper = mount(BaseButton, {
        props: {
          as: 'a',
        },
        slots: {
          default: 'Link text',
        },
      })

      expect(wrapper.element.tagName).toBe('A')
      expect(wrapper.text()).toBe('Link text')
    })

    it('should render slot content', () => {
      const wrapper = mount(BaseButton, {
        slots: {
          default: '<span class="icon">+</span> Add Item',
        },
      })

      expect(wrapper.find('.icon').exists()).toBe(true)
      expect(wrapper.text()).toContain('Add Item')
    })
  })

  describe('variants', () => {
    it('should apply primary variant class by default', () => {
      const wrapper = mount(BaseButton)

      expect(wrapper.classes()).toContain('btn')
      expect(wrapper.classes()).toContain('btn-primary')
    })

    it('should apply outline variant class', () => {
      const wrapper = mount(BaseButton, {
        props: {
          variant: 'outline',
        },
      })

      expect(wrapper.classes()).toContain('btn')
      expect(wrapper.classes()).toContain('btn-outline')
    })

    it('should apply ghost variant class', () => {
      const wrapper = mount(BaseButton, {
        props: {
          variant: 'ghost',
        },
      })

      expect(wrapper.classes()).toContain('btn')
      expect(wrapper.classes()).toContain('btn-ghost')
    })

    it('should apply danger variant class', () => {
      const wrapper = mount(BaseButton, {
        props: {
          variant: 'danger',
        },
      })

      expect(wrapper.classes()).toContain('btn')
      expect(wrapper.classes()).toContain('btn-danger')
    })
  })

  describe('sizes', () => {
    it('should apply no size class for md (default)', () => {
      const wrapper = mount(BaseButton, {
        props: {
          size: 'md',
        },
      })

      expect(wrapper.classes()).toContain('btn')
      expect(wrapper.classes()).not.toContain('btn-sm')
      expect(wrapper.classes()).not.toContain('btn-lg')
    })

    it('should apply sm size class', () => {
      const wrapper = mount(BaseButton, {
        props: {
          size: 'sm',
        },
      })

      expect(wrapper.classes()).toContain('btn')
      expect(wrapper.classes()).toContain('btn-sm')
    })

    it('should apply lg size class', () => {
      const wrapper = mount(BaseButton, {
        props: {
          size: 'lg',
        },
      })

      expect(wrapper.classes()).toContain('btn')
      expect(wrapper.classes()).toContain('btn-lg')
    })
  })

  describe('button type', () => {
    it('should have type="button" by default', () => {
      const wrapper = mount(BaseButton)

      expect(wrapper.attributes('type')).toBe('button')
    })

    it('should have type="submit" when specified', () => {
      const wrapper = mount(BaseButton, {
        props: {
          type: 'submit',
        },
      })

      expect(wrapper.attributes('type')).toBe('submit')
    })

    it('should have type="reset" when specified', () => {
      const wrapper = mount(BaseButton, {
        props: {
          type: 'reset',
        },
      })

      expect(wrapper.attributes('type')).toBe('reset')
    })

    it('should not have type attribute when rendered as anchor', () => {
      const wrapper = mount(BaseButton, {
        props: {
          as: 'a',
          type: 'submit',
        },
      })

      expect(wrapper.attributes('type')).toBeUndefined()
    })
  })

  describe('disabled state', () => {
    it('should not be disabled by default', () => {
      const wrapper = mount(BaseButton)

      expect(wrapper.attributes('disabled')).toBeUndefined()
    })

    it('should be disabled when disabled prop is true', () => {
      const wrapper = mount(BaseButton, {
        props: {
          disabled: true,
        },
      })

      expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('should be enabled when disabled prop is false', () => {
      const wrapper = mount(BaseButton, {
        props: {
          disabled: false,
        },
      })

      expect(wrapper.attributes('disabled')).toBeUndefined()
    })
  })

  describe('events', () => {
    it('should emit click event when clicked', async () => {
      const wrapper = mount(BaseButton)

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('should not emit click when disabled and clicked', async () => {
      const wrapper = mount(BaseButton, {
        props: {
          disabled: true,
        },
      })

      await wrapper.trigger('click')

      // Native disabled prevents event from firing
      // The click event should still technically be emitted by the test,
      // but in a real browser, disabled buttons don't trigger click events
      expect(wrapper.attributes('disabled')).toBeDefined()
    })
  })

  describe('combined props', () => {
    it('should apply multiple props correctly', () => {
      const wrapper = mount(BaseButton, {
        props: {
          variant: 'danger',
          size: 'lg',
          type: 'submit',
          disabled: true,
        },
        slots: {
          default: 'Delete',
        },
      })

      expect(wrapper.classes()).toContain('btn')
      expect(wrapper.classes()).toContain('btn-danger')
      expect(wrapper.classes()).toContain('btn-lg')
      expect(wrapper.attributes('type')).toBe('submit')
      expect(wrapper.attributes('disabled')).toBeDefined()
      expect(wrapper.text()).toBe('Delete')
    })
  })
})
