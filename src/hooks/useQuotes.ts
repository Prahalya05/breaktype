import { useState, useCallback } from 'react'
import { pickRandomQuote } from '../lib/quotes'

export function useQuotes() {
  const [quote, setQuote] = useState<string>(() => pickRandomQuote())

  const nextQuote = useCallback(() => {
    setQuote((current) => pickRandomQuote(current))
  }, [])

  return { quote, nextQuote }
}
