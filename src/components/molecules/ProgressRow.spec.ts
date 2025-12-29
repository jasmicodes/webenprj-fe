import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressRow from './ProgressRow.vue'

// Mock child components
vi.mock('@/components/atoms/BaseProgressRing.vue', () => ({
  default: {
    name: 'BaseProgressRing',
    props: ['progress', 'size'],
    template: '<div class="mock-progress-ring" :data-progress="progress" :data-size="size"></div>',
  },
}))

vi.mock('@/components/atoms/BaseButton.vue', () => ({
  default: {
    name: 'BaseButton',
    props: ['variant'],
    template: '<button class="mock-button"><slot /></button>',
  },
}))

describe('ProgressRow', () => {
  describe('rendering', () => {
    it('should render subject name', () => {
      const wrapper = mount(ProgressRow, {
        props: {
          subject: 'Mathematics',
        },
      })

      expect(wrapper.text()).toContain('Mathematics')
    })

    it('should render progress ring', () => {
      const wrapper = mount(ProgressRow, {
        props: {
          subject: 'Math',
        },
      })

      expect(wrapper.find('.mock-progress-ring').exists()).toBe(true)
    })

    it('should render share button', () => {
      const wrapper = mount(ProgressRow, {
        props: {
          subject: 'Math',
        },
      })

      expect(wrapper.find('.mock-button').exists()).toBe(true)
      expect(wrapper.find('.mock-button').text()).toBe('Share Progress')
    })
  })

  describe('label', () => {
    it('should show post count label with defaults', () => {
      const wrapper = mount(ProgressRow, {
        props: {
          subject: 'Math',
        },
      })

      expect(wrapper.text()).toContain('Post 0/30')
    })

    it('should show custom post count and goal', () => {
      const wrapper = mount(ProgressRow, {
        props: {
          subject: 'Math',
          posts: 15,
          goal: 50,
        },
      })

      expect(wrapper.text()).toContain('Post 15/50')
    })
  })

  describe('progress calculation', () => {
    it('should calculate 0% progress with no posts', () => {
      const wrapper = mount(ProgressRow, {
        props: {
          subject: 'Math',
          posts: 0,
          goal: 30,
        },
      })

      const ring = wrapper.find('.mock-progress-ring')
      expect(ring.attributes('data-progress')).toBe('0')
    })

    it('should calculate 50% progress correctly', () => {
      const wrapper = mount(ProgressRow, {
        props: {
          subject: 'Math',
          posts: 15,
          goal: 30,
        },
      })

      const ring = wrapper.find('.mock-progress-ring')
      expect(ring.attributes('data-progress')).toBe('50')
    })

    it('should calculate 100% progress correctly', () => {
      const wrapper = mount(ProgressRow, {
        props: {
          subject: 'Math',
          posts: 30,
          goal: 30,
        },
      })

      const ring = wrapper.find('.mock-progress-ring')
      expect(ring.attributes('data-progress')).toBe('100')
    })

    it('should cap progress at 100%', () => {
      const wrapper = mount(ProgressRow, {
        props: {
          subject: 'Math',
          posts: 50,
          goal: 30,
        },
      })

      const ring = wrapper.find('.mock-progress-ring')
      expect(ring.attributes('data-progress')).toBe('100')
    })

    it('should handle zero goal gracefully', () => {
      const wrapper = mount(ProgressRow, {
        props: {
          subject: 'Math',
          posts: 10,
          goal: 0,
        },
      })

      const ring = wrapper.find('.mock-progress-ring')
      // Should be 0 when goal is 0 (division by zero handled)
      expect(ring.attributes('data-progress')).toBe('0')
    })
  })

  describe('progressbar accessibility', () => {
    it('should have progressbar role', () => {
      const wrapper = mount(ProgressRow, {
        props: {
          subject: 'Math',
          posts: 15,
          goal: 30,
        },
      })

      const progressbar = wrapper.find('[role="progressbar"]')
      expect(progressbar.exists()).toBe(true)
    })

    it('should have aria-valuenow attribute', () => {
      const wrapper = mount(ProgressRow, {
        props: {
          subject: 'Math',
          posts: 15,
          goal: 30,
        },
      })

      const progressbar = wrapper.find('[role="progressbar"]')
      expect(progressbar.attributes('aria-valuenow')).toBe('50')
    })

    it('should have aria-valuemin and aria-valuemax', () => {
      const wrapper = mount(ProgressRow, {
        props: {
          subject: 'Math',
        },
      })

      const progressbar = wrapper.find('[role="progressbar"]')
      expect(progressbar.attributes('aria-valuemin')).toBe('0')
      expect(progressbar.attributes('aria-valuemax')).toBe('100')
    })
  })

  describe('progress bar width', () => {
    it('should set correct width style on progress bar', () => {
      const wrapper = mount(ProgressRow, {
        props: {
          subject: 'Math',
          posts: 15,
          goal: 30,
        },
      })

      const progressbar = wrapper.find('[role="progressbar"]')
      expect(progressbar.attributes('style')).toContain('width: 50%')
    })
  })
})
