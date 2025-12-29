import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from './EmptyState.vue'

// Mock BaseIcon component
vi.mock('@/components/atoms/BaseIcon.vue', () => ({
  default: {
    name: 'BaseIcon',
    props: ['name'],
    template: '<span class="mock-icon" :data-name="name"></span>',
  },
}))

describe('EmptyState', () => {
  describe('rendering', () => {
    it('should render title', () => {
      const wrapper = mount(EmptyState, {
        props: {
          title: 'No items found',
        },
      })

      expect(wrapper.find('h3').text()).toBe('No items found')
    })

    it('should have centered layout classes', () => {
      const wrapper = mount(EmptyState, {
        props: {
          title: 'Empty',
        },
      })

      expect(wrapper.classes()).toContain('flex')
      expect(wrapper.classes()).toContain('flex-col')
      expect(wrapper.classes()).toContain('items-center')
      expect(wrapper.classes()).toContain('text-center')
    })
  })

  describe('icon', () => {
    it('should render icon when provided', () => {
      const wrapper = mount(EmptyState, {
        props: {
          title: 'Empty',
          icon: 'inbox',
        },
      })

      expect(wrapper.find('.mock-icon').exists()).toBe(true)
      expect(wrapper.find('.mock-icon').attributes('data-name')).toBe('inbox')
    })

    it('should not render icon when not provided', () => {
      const wrapper = mount(EmptyState, {
        props: {
          title: 'Empty',
        },
      })

      expect(wrapper.find('.mock-icon').exists()).toBe(false)
    })
  })

  describe('hint', () => {
    it('should render hint when provided', () => {
      const wrapper = mount(EmptyState, {
        props: {
          title: 'No bookmarks',
          hint: 'Try adding some bookmarks to see them here',
        },
      })

      expect(wrapper.find('p').exists()).toBe(true)
      expect(wrapper.find('p').text()).toBe('Try adding some bookmarks to see them here')
    })

    it('should not render hint paragraph when not provided', () => {
      const wrapper = mount(EmptyState, {
        props: {
          title: 'Empty',
        },
      })

      expect(wrapper.find('p').exists()).toBe(false)
    })
  })

  describe('action slot', () => {
    it('should render action slot when provided', () => {
      const wrapper = mount(EmptyState, {
        props: {
          title: 'Empty',
        },
        slots: {
          action: '<button>Add Item</button>',
        },
      })

      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.find('button').text()).toBe('Add Item')
    })

    it('should not render extra elements when action slot is empty', () => {
      const wrapper = mount(EmptyState, {
        props: {
          title: 'Empty',
        },
      })

      expect(wrapper.find('button').exists()).toBe(false)
    })
  })

  describe('complete examples', () => {
    it('should render all elements together', () => {
      const wrapper = mount(EmptyState, {
        props: {
          icon: 'bookmark',
          title: 'No bookmarks yet',
          hint: 'Save posts to view them later',
        },
        slots: {
          action: '<button class="btn">Browse Posts</button>',
        },
      })

      expect(wrapper.find('.mock-icon').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe('No bookmarks yet')
      expect(wrapper.find('p').text()).toBe('Save posts to view them later')
      expect(wrapper.find('button.btn').text()).toBe('Browse Posts')
    })

    it('should render minimal version with only title', () => {
      const wrapper = mount(EmptyState, {
        props: {
          title: 'Nothing here',
        },
      })

      expect(wrapper.find('h3').text()).toBe('Nothing here')
      expect(wrapper.find('.mock-icon').exists()).toBe(false)
      expect(wrapper.find('p').exists()).toBe(false)
    })
  })
})
