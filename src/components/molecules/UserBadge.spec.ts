import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserBadge from './UserBadge.vue'

// Mock BaseAvatar component
vi.mock('@/components/atoms/BaseAvatar.vue', () => ({
  default: {
    name: 'BaseAvatar',
    props: ['src', 'size'],
    template: '<div class="mock-avatar" :data-src="src" :data-size="size"></div>',
  },
}))

describe('UserBadge', () => {
  describe('rendering', () => {
    it('should render user name', () => {
      const wrapper = mount(UserBadge, {
        props: {
          name: 'John Doe',
        },
      })

      expect(wrapper.text()).toContain('John Doe')
    })

    it('should render avatar', () => {
      const wrapper = mount(UserBadge, {
        props: {
          name: 'John Doe',
          src: 'https://example.com/avatar.jpg',
        },
      })

      const avatar = wrapper.find('.mock-avatar')
      expect(avatar.exists()).toBe(true)
      expect(avatar.attributes('data-src')).toBe('https://example.com/avatar.jpg')
    })

    it('should have flex layout', () => {
      const wrapper = mount(UserBadge, {
        props: {
          name: 'John Doe',
        },
      })

      expect(wrapper.classes()).toContain('flex')
      expect(wrapper.classes()).toContain('items-center')
    })
  })

  describe('subtitle', () => {
    it('should render subtitle when provided', () => {
      const wrapper = mount(UserBadge, {
        props: {
          name: 'John Doe',
          subtitle: '@johndoe',
        },
      })

      expect(wrapper.text()).toContain('@johndoe')
    })

    it('should not render subtitle when not provided', () => {
      const wrapper = mount(UserBadge, {
        props: {
          name: 'John Doe',
        },
      })

      const subtitleElement = wrapper.findAll('.text-sm.text-neutral-600')
      expect(subtitleElement.length).toBe(0)
    })
  })

  describe('avatar size', () => {
    it('should use md size by default', () => {
      const wrapper = mount(UserBadge, {
        props: {
          name: 'John Doe',
        },
      })

      const avatar = wrapper.find('.mock-avatar')
      expect(avatar.attributes('data-size')).toBe('md')
    })

    it('should pass size prop to avatar', () => {
      const wrapper = mount(UserBadge, {
        props: {
          name: 'John Doe',
          size: 'lg',
        },
      })

      const avatar = wrapper.find('.mock-avatar')
      expect(avatar.attributes('data-size')).toBe('lg')
    })

    it('should support sm size', () => {
      const wrapper = mount(UserBadge, {
        props: {
          name: 'John Doe',
          size: 'sm',
        },
      })

      const avatar = wrapper.find('.mock-avatar')
      expect(avatar.attributes('data-size')).toBe('sm')
    })
  })

  describe('truncation', () => {
    it('should have truncate class on name', () => {
      const wrapper = mount(UserBadge, {
        props: {
          name: 'Very Long Name That Should Be Truncated',
        },
      })

      const nameElement = wrapper.find('.font-medium.truncate')
      expect(nameElement.exists()).toBe(true)
    })
  })
})
