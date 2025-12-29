import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseCard from './BaseCard.vue'

describe('BaseCard', () => {
  describe('rendering', () => {
    it('should render as an article element', () => {
      const wrapper = mount(BaseCard)

      expect(wrapper.element.tagName).toBe('ARTICLE')
    })

    it('should render default slot content', () => {
      const wrapper = mount(BaseCard, {
        slots: {
          default: '<p>Card content</p>',
        },
      })

      expect(wrapper.text()).toContain('Card content')
    })

    it('should have base styling classes', () => {
      const wrapper = mount(BaseCard)

      expect(wrapper.classes()).toContain('bg-white')
      expect(wrapper.classes()).toContain('rounded-2xl')
      expect(wrapper.classes()).toContain('border')
    })
  })

  describe('slots', () => {
    it('should render header slot when provided', () => {
      const wrapper = mount(BaseCard, {
        slots: {
          header: '<h2>Card Header</h2>',
          default: 'Body content',
        },
      })

      expect(wrapper.find('header').exists()).toBe(true)
      expect(wrapper.text()).toContain('Card Header')
    })

    it('should not render header when slot is empty', () => {
      const wrapper = mount(BaseCard, {
        slots: {
          default: 'Body content',
        },
      })

      expect(wrapper.find('header').exists()).toBe(false)
    })

    it('should render actions slot when provided', () => {
      const wrapper = mount(BaseCard, {
        slots: {
          default: 'Body content',
          actions: '<button>Action</button>',
        },
      })

      expect(wrapper.find('footer').exists()).toBe(true)
      expect(wrapper.text()).toContain('Action')
    })

    it('should not render footer when actions slot is empty', () => {
      const wrapper = mount(BaseCard, {
        slots: {
          default: 'Body content',
        },
      })

      expect(wrapper.find('footer').exists()).toBe(false)
    })

    it('should render all slots together', () => {
      const wrapper = mount(BaseCard, {
        slots: {
          header: '<h2>Title</h2>',
          default: '<p>Content</p>',
          actions: '<button>Submit</button>',
        },
      })

      expect(wrapper.find('header').exists()).toBe(true)
      expect(wrapper.find('footer').exists()).toBe(true)
      expect(wrapper.text()).toContain('Title')
      expect(wrapper.text()).toContain('Content')
      expect(wrapper.text()).toContain('Submit')
    })
  })

  describe('conditional styling', () => {
    it('should have pb-4 class on body when header is present', () => {
      const wrapper = mount(BaseCard, {
        slots: {
          header: '<h2>Header</h2>',
          default: 'Body',
        },
      })

      const body = wrapper.find('div.px-5')
      expect(body.classes()).toContain('pb-4')
      expect(body.classes()).not.toContain('py-4')
    })

    it('should have py-4 class on body when no header', () => {
      const wrapper = mount(BaseCard, {
        slots: {
          default: 'Body only',
        },
      })

      const body = wrapper.find('div.px-5')
      expect(body.classes()).toContain('py-4')
    })
  })
})
