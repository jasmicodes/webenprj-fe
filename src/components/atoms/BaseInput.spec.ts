import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseInput from './BaseInput.vue'

describe('BaseInput', () => {
  describe('rendering', () => {
    it('should render an input element', () => {
      const wrapper = mount(BaseInput)

      expect(wrapper.element.tagName).toBe('INPUT')
    })

    it('should have type="text" by default', () => {
      const wrapper = mount(BaseInput)

      expect(wrapper.attributes('type')).toBe('text')
    })

    it('should apply input class by default', () => {
      const wrapper = mount(BaseInput)

      expect(wrapper.classes()).toContain('input')
    })
  })

  describe('types', () => {
    it('should render as email input when type="email"', () => {
      const wrapper = mount(BaseInput, {
        props: {
          type: 'email',
        },
      })

      expect(wrapper.attributes('type')).toBe('email')
    })

    it('should render as password input when type="password"', () => {
      const wrapper = mount(BaseInput, {
        props: {
          type: 'password',
        },
      })

      expect(wrapper.attributes('type')).toBe('password')
    })

    it('should render as number input when type="number"', () => {
      const wrapper = mount(BaseInput, {
        props: {
          type: 'number',
        },
      })

      expect(wrapper.attributes('type')).toBe('number')
    })
  })

  describe('v-model binding', () => {
    it('should display the modelValue', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: 'test value',
        },
      })

      expect(wrapper.element.value).toBe('test value')
    })

    it('should emit update:modelValue on input', async () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
        },
      })

      await wrapper.setValue('new value')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['new value'])
    })

    it('should handle empty modelValue', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
        },
      })

      expect(wrapper.element.value).toBe('')
    })
  })

  describe('placeholder', () => {
    it('should display placeholder text', () => {
      const wrapper = mount(BaseInput, {
        props: {
          placeholder: 'Enter your email',
        },
      })

      expect(wrapper.attributes('placeholder')).toBe('Enter your email')
    })

    it('should have no placeholder by default', () => {
      const wrapper = mount(BaseInput)

      expect(wrapper.attributes('placeholder')).toBeUndefined()
    })
  })

  describe('invalid state', () => {
    it('should not have invalid class by default', () => {
      const wrapper = mount(BaseInput)

      expect(wrapper.classes()).not.toContain('invalid')
    })

    it('should have invalid class when invalid prop is true', () => {
      const wrapper = mount(BaseInput, {
        props: {
          invalid: true,
        },
      })

      expect(wrapper.classes()).toContain('invalid')
    })

    it('should not have invalid class when invalid prop is false', () => {
      const wrapper = mount(BaseInput, {
        props: {
          invalid: false,
        },
      })

      expect(wrapper.classes()).not.toContain('invalid')
    })
  })

  describe('sizes', () => {
    it('should not apply size classes for default (md)', () => {
      const wrapper = mount(BaseInput)

      expect(wrapper.classes()).not.toContain('text-sm')
      expect(wrapper.classes()).not.toContain('py-1.5')
    })

    it('should apply small size classes when size="sm"', () => {
      const wrapper = mount(BaseInput, {
        props: {
          size: 'sm',
        },
      })

      expect(wrapper.classes()).toContain('text-sm')
      expect(wrapper.classes()).toContain('py-1.5')
      expect(wrapper.classes()).toContain('px-2.5')
    })
  })

  describe('maxlength', () => {
    it('should set maxlength attribute', () => {
      const wrapper = mount(BaseInput, {
        props: {
          maxlength: 50,
        },
      })

      expect(wrapper.attributes('maxlength')).toBe('50')
    })

    it('should accept string maxlength', () => {
      const wrapper = mount(BaseInput, {
        props: {
          maxlength: '100',
        },
      })

      expect(wrapper.attributes('maxlength')).toBe('100')
    })
  })

  describe('id attribute', () => {
    it('should set id attribute for label association', () => {
      const wrapper = mount(BaseInput, {
        props: {
          id: 'email-input',
        },
      })

      expect(wrapper.attributes('id')).toBe('email-input')
    })

    it('should have no id by default', () => {
      const wrapper = mount(BaseInput)

      expect(wrapper.attributes('id')).toBeUndefined()
    })
  })

  describe('combined props', () => {
    it('should apply multiple props correctly', () => {
      const wrapper = mount(BaseInput, {
        props: {
          id: 'password-input',
          type: 'password',
          modelValue: 'secret123',
          placeholder: 'Enter password',
          invalid: true,
          size: 'sm',
          maxlength: 255,
        },
      })

      expect(wrapper.attributes('id')).toBe('password-input')
      expect(wrapper.attributes('type')).toBe('password')
      expect(wrapper.element.value).toBe('secret123')
      expect(wrapper.attributes('placeholder')).toBe('Enter password')
      expect(wrapper.classes()).toContain('invalid')
      expect(wrapper.classes()).toContain('text-sm')
      expect(wrapper.attributes('maxlength')).toBe('255')
    })
  })
})
