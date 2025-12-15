import { describe, it, expect } from 'vitest'
import {
  normalizeTagName,
  formatTagDisplay,
  isValidTag,
  prepareTagForBackend,
  processTagFromBackend,
} from './tagUtils'

describe('tagUtils', () => {
  describe('normalizeTagName', () => {
    it('should remove single leading # from tag', () => {
      expect(normalizeTagName('#web')).toBe('web')
      expect(normalizeTagName('#webengineering')).toBe('webengineering')
    })

    it('should remove multiple leading # characters', () => {
      expect(normalizeTagName('##web')).toBe('web')
      expect(normalizeTagName('###webengineering')).toBe('webengineering')
    })

    it('should trim whitespace before and after tag', () => {
      expect(normalizeTagName(' #web ')).toBe('web')
      expect(normalizeTagName('  web  ')).toBe('web')
      expect(normalizeTagName(' #  web ')).toBe('web')
    })

    it('should handle tag without # prefix', () => {
      expect(normalizeTagName('web')).toBe('web')
      expect(normalizeTagName('webengineering')).toBe('webengineering')
    })

    it('should return empty string for empty input', () => {
      expect(normalizeTagName('')).toBe('')
      expect(normalizeTagName('   ')).toBe('')
      expect(normalizeTagName('#')).toBe('')
      expect(normalizeTagName('##')).toBe('')
    })

    it('should preserve internal spaces, dashes, and underscores', () => {
      expect(normalizeTagName('#web engineering')).toBe('web engineering')
      expect(normalizeTagName('#web-dev')).toBe('web-dev')
      expect(normalizeTagName('#web_dev')).toBe('web_dev')
    })
  })

  describe('formatTagDisplay', () => {
    it('should add # prefix to tag without #', () => {
      expect(formatTagDisplay('web')).toBe('#web')
      expect(formatTagDisplay('webengineering')).toBe('#webengineering')
    })

    it('should ensure exactly one # for tag with single #', () => {
      expect(formatTagDisplay('#web')).toBe('#web')
      expect(formatTagDisplay('#webengineering')).toBe('#webengineering')
    })

    it('should normalize multiple # to exactly one', () => {
      expect(formatTagDisplay('##web')).toBe('#web')
      expect(formatTagDisplay('###webengineering')).toBe('#webengineering')
    })

    it('should handle whitespace correctly', () => {
      expect(formatTagDisplay(' web ')).toBe('#web')
      expect(formatTagDisplay(' #web ')).toBe('#web')
    })

    it('should return empty string for empty input', () => {
      expect(formatTagDisplay('')).toBe('')
      expect(formatTagDisplay('   ')).toBe('')
      expect(formatTagDisplay('#')).toBe('')
    })

    it('should preserve internal spaces, dashes, and underscores', () => {
      expect(formatTagDisplay('web engineering')).toBe('#web engineering')
      expect(formatTagDisplay('web-dev')).toBe('#web-dev')
      expect(formatTagDisplay('web_dev')).toBe('#web_dev')
    })
  })

  describe('isValidTag', () => {
    describe('valid tags', () => {
      it('should accept tags with minimum length (2 chars)', () => {
        expect(isValidTag('ab')).toBe(true)
        expect(isValidTag('#ab')).toBe(true)
      })

      it('should accept tags with maximum length (30 chars)', () => {
        const thirtyChars = 'a'.repeat(30)
        expect(isValidTag(thirtyChars)).toBe(true)
        expect(isValidTag(`#${thirtyChars}`)).toBe(true)
      })

      it('should accept tags with letters', () => {
        expect(isValidTag('web')).toBe(true)
        expect(isValidTag('WebEngineering')).toBe(true)
      })

      it('should accept tags with numbers', () => {
        expect(isValidTag('web2')).toBe(true)
        expect(isValidTag('2024')).toBe(true)
      })

      it('should accept tags with spaces', () => {
        expect(isValidTag('web engineering')).toBe(true)
        expect(isValidTag('data science')).toBe(true)
      })

      it('should accept tags with dashes', () => {
        expect(isValidTag('web-dev')).toBe(true)
        expect(isValidTag('front-end')).toBe(true)
      })

      it('should accept tags with underscores', () => {
        expect(isValidTag('web_dev')).toBe(true)
        expect(isValidTag('machine_learning')).toBe(true)
      })

      it('should accept tags with mixed valid characters', () => {
        expect(isValidTag('Web_Dev-2024')).toBe(true)
        expect(isValidTag('AI ML 123')).toBe(true)
      })
    })

    describe('invalid tags', () => {
      it('should reject empty string', () => {
        expect(isValidTag('')).toBe(false)
      })

      it('should reject tags too short (< 2 chars)', () => {
        expect(isValidTag('a')).toBe(false)
        expect(isValidTag('#a')).toBe(false)
      })

      it('should reject tags too long (> 30 chars)', () => {
        const thirtyOneChars = 'a'.repeat(31)
        expect(isValidTag(thirtyOneChars)).toBe(false)
        expect(isValidTag(`#${thirtyOneChars}`)).toBe(false)
      })

      it('should reject tags with special characters', () => {
        expect(isValidTag('web@dev')).toBe(false)
        expect(isValidTag('web!dev')).toBe(false)
        expect(isValidTag('web$dev')).toBe(false)
        expect(isValidTag('web%dev')).toBe(false)
        expect(isValidTag('web&dev')).toBe(false)
        expect(isValidTag('web*dev')).toBe(false)
        expect(isValidTag('web(dev)')).toBe(false)
        expect(isValidTag('web+dev')).toBe(false)
        expect(isValidTag('web=dev')).toBe(false)
      })

      it('should reject tags with dots', () => {
        expect(isValidTag('web.dev')).toBe(false)
      })

      it('should reject tags with slashes', () => {
        expect(isValidTag('web/dev')).toBe(false)
        expect(isValidTag('web\\dev')).toBe(false)
      })

      it('should reject tags with quotes', () => {
        expect(isValidTag("web'dev")).toBe(false)
        expect(isValidTag('web"dev')).toBe(false)
      })
    })
  })

  describe('prepareTagForBackend', () => {
    it('should return normalized tag name (without #)', () => {
      expect(prepareTagForBackend('#web')).toBe('web')
      expect(prepareTagForBackend('web')).toBe('web')
      expect(prepareTagForBackend('##web')).toBe('web')
    })

    it('should trim whitespace', () => {
      expect(prepareTagForBackend(' #web ')).toBe('web')
      expect(prepareTagForBackend(' web ')).toBe('web')
    })

    it('should preserve internal spaces, dashes, underscores', () => {
      expect(prepareTagForBackend('web engineering')).toBe('web engineering')
      expect(prepareTagForBackend('web-dev')).toBe('web-dev')
      expect(prepareTagForBackend('web_dev')).toBe('web_dev')
    })

    it('should handle empty string', () => {
      expect(prepareTagForBackend('')).toBe('')
    })
  })

  describe('processTagFromBackend', () => {
    it('should normalize tag received with # prefix', () => {
      expect(processTagFromBackend('#web')).toBe('web')
      expect(processTagFromBackend('#webengineering')).toBe('webengineering')
    })

    it('should normalize tag received without # prefix', () => {
      expect(processTagFromBackend('web')).toBe('web')
      expect(processTagFromBackend('webengineering')).toBe('webengineering')
    })

    it('should handle multiple # characters', () => {
      expect(processTagFromBackend('##web')).toBe('web')
    })

    it('should trim whitespace', () => {
      expect(processTagFromBackend(' #web ')).toBe('web')
      expect(processTagFromBackend(' web ')).toBe('web')
    })

    it('should preserve internal spaces, dashes, underscores', () => {
      expect(processTagFromBackend('#web engineering')).toBe('web engineering')
      expect(processTagFromBackend('web-dev')).toBe('web-dev')
      expect(processTagFromBackend('web_dev')).toBe('web_dev')
    })

    it('should handle empty string', () => {
      expect(processTagFromBackend('')).toBe('')
    })
  })

  describe('integration scenarios', () => {
    it('should handle round-trip: display → backend → display', () => {
      const userInput = '#webengineering'
      const normalized = normalizeTagName(userInput) // 'webengineering'
      const forBackend = prepareTagForBackend(normalized) // 'webengineering'
      const fromBackend = processTagFromBackend(forBackend) // 'webengineering'
      const display = formatTagDisplay(fromBackend) // '#webengineering'

      expect(display).toBe('#webengineering')
    })

    it('should normalize messy input for consistent storage and display', () => {
      const messyInput = '  ##web  '
      const normalized = normalizeTagName(messyInput) // 'web'
      const display = formatTagDisplay(normalized) // '#web'

      expect(normalized).toBe('web')
      expect(display).toBe('#web')
    })

    it('should validate after normalization', () => {
      // Valid after normalization
      expect(isValidTag(normalizeTagName('#web'))).toBe(true)
      expect(isValidTag(normalizeTagName('##webengineering'))).toBe(true)

      // Invalid even after normalization (too short)
      expect(isValidTag(normalizeTagName('#a'))).toBe(false)

      // Invalid even after normalization (special chars)
      expect(isValidTag(normalizeTagName('#web@dev'))).toBe(false)
    })
  })
})
