import { pickRandomWord } from '../words/common1000'

const PUNCTUATION_MARKS = [',', '.', '!', '?', ';', ':']

export interface WordGenOptions {
  punctuation: boolean
  numbers: boolean
}

function randomNumber(): string {
  const digits = Math.random() < 0.75 ? 1 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 2)
  let s = ''
  for (let i = 0; i < digits; i++) s += Math.floor(Math.random() * 10)
  return s
}

/**
 * Generates a chunk of words for the typing test, optionally mixing in numbers and
 * punctuation. Punctuation is attached directly to its word (e.g. "Hello,") so the
 * engine can treat each generated string as one atomic "word" to type.
 */
export function generateWords(count: number, options: WordGenOptions, prevLastWord?: string): string[] {
  const words: string[] = []
  let lastWord = prevLastWord
  let sinceMark = 0
  let capitalizeNext = true

  for (let i = 0; i < count; i++) {
    let word = options.numbers && Math.random() < 0.08 ? randomNumber() : pickRandomWord(lastWord)
    lastWord = word

    if (options.punctuation) {
      if (capitalizeNext && /^[a-z]/.test(word)) {
        word = word[0].toUpperCase() + word.slice(1)
        capitalizeNext = false
      }
      sinceMark++
      const isLast = i === count - 1
      if (!isLast && sinceMark > 3 && Math.random() < 0.14) {
        const mark = PUNCTUATION_MARKS[Math.floor(Math.random() * PUNCTUATION_MARKS.length)]
        word += mark
        sinceMark = 0
        if (mark === '.' || mark === '!' || mark === '?') capitalizeNext = true
      }
    }

    words.push(word)
  }

  return words
}
