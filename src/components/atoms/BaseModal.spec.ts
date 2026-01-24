import { describe, it, expect, afterEach } from 'vitest'
import { mount, config } from '@vue/test-utils'
import BaseModal from './BaseModal.vue'

// Disable teleport stubs for these tests
config.global.stubs = {
  teleport: true,
}

describe('BaseModal', () => {
  // Clean up body after each test
  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('visibility', () => {
    it('should not render when model is false', () => {
      const wrapper = mount(BaseModal, {
        props: {
          modelValue: false,
        },
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    })

    it('should render when model is true', () => {
      const wrapper = mount(BaseModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    })

    it('should have aria-modal="true" for accessibility', () => {
      const wrapper = mount(BaseModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      expect(wrapper.find('[role="dialog"]').attributes('aria-modal')).toBe('true')
    })
  })

  describe('slot content', () => {
    it('should render slot content', () => {
      const wrapper = mount(BaseModal, {
        props: {
          modelValue: true,
        },
        slots: {
          default: '<div class="modal-content">Modal Body</div>',
        },
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      expect(wrapper.find('.modal-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('Modal Body')
    })
  })

  describe('backdrop click', () => {
    it('should close on backdrop click by default', async () => {
      const wrapper = mount(BaseModal, {
        props: {
          modelValue: true,
          'onUpdate:modelValue': (value: boolean) => wrapper.setProps({ modelValue: value }),
        },
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Find the backdrop (the absolute inset element)
      const backdrop = wrapper.find('.absolute.inset-0')
      await backdrop.trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
    })

    it('should not close on backdrop click when closeOnBackdrop is false', async () => {
      const wrapper = mount(BaseModal, {
        props: {
          modelValue: true,
          closeOnBackdrop: false,
          'onUpdate:modelValue': (value: boolean) => wrapper.setProps({ modelValue: value }),
        },
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      const backdrop = wrapper.find('.absolute.inset-0')
      await backdrop.trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
  })

  describe('escape key', () => {
    it('should close on escape key by default', async () => {
      const wrapper = mount(BaseModal, {
        props: {
          modelValue: true,
          'onUpdate:modelValue': (value: boolean) => wrapper.setProps({ modelValue: value }),
        },
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      const dialog = wrapper.find('[role="dialog"]')
      await dialog.trigger('keydown.esc')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
    })

    it('should not close on escape key when closable is false', async () => {
      const wrapper = mount(BaseModal, {
        props: {
          modelValue: true,
          closable: false,
          'onUpdate:modelValue': (value: boolean) => wrapper.setProps({ modelValue: value }),
        },
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      const dialog = wrapper.find('[role="dialog"]')
      await dialog.trigger('keydown.esc')

      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
  })

  describe('props combinations', () => {
    it('should be fully closable by default', async () => {
      const wrapper = mount(BaseModal, {
        props: {
          modelValue: true,
          'onUpdate:modelValue': (value: boolean) => wrapper.setProps({ modelValue: value }),
        },
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Both backdrop and escape should work
      const backdrop = wrapper.find('.absolute.inset-0')
      await backdrop.trigger('click')
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])

      // Reset
      await wrapper.setProps({ modelValue: true })

      const dialog = wrapper.find('[role="dialog"]')
      await dialog.trigger('keydown.esc')
      expect(wrapper.emitted('update:modelValue')![1]).toEqual([false])
    })

    it('should be completely non-closable when both props are false', async () => {
      const wrapper = mount(BaseModal, {
        props: {
          modelValue: true,
          closable: false,
          closeOnBackdrop: false,
          'onUpdate:modelValue': (value: boolean) => wrapper.setProps({ modelValue: value }),
        },
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      // Neither backdrop nor escape should work
      const backdrop = wrapper.find('.absolute.inset-0')
      await backdrop.trigger('click')

      const dialog = wrapper.find('[role="dialog"]')
      await dialog.trigger('keydown.esc')

      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
  })

  describe('styling', () => {
    it('should have fixed positioning for overlay', () => {
      const wrapper = mount(BaseModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      const dialog = wrapper.find('[role="dialog"]')
      expect(dialog.classes()).toContain('fixed')
      expect(dialog.classes()).toContain('inset-0')
      expect(dialog.classes()).toContain('z-50')
    })

    it('should have semi-transparent backdrop', () => {
      const wrapper = mount(BaseModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      const backdrop = wrapper.find('.absolute.inset-0')
      expect(backdrop.exists()).toBe(true)
      // Check for backdrop styling class
      expect(backdrop.classes().some((c) => c.includes('bg-neutral'))).toBe(true)
    })

    it('should center content', () => {
      const wrapper = mount(BaseModal, {
        props: {
          modelValue: true,
        },
        global: {
          stubs: {
            teleport: true,
          },
        },
      })

      const dialog = wrapper.find('[role="dialog"]')
      expect(dialog.classes()).toContain('flex')
      expect(dialog.classes()).toContain('items-center')
      expect(dialog.classes()).toContain('justify-center')
    })
  })
})
