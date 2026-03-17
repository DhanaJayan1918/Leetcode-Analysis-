import { useState, useEffect } from 'react'
import { Student, AutocompleteResponse } from '../types/api'
import { fetcher, handleApiError } from '../utils/api'

export const useAutocomplete = (query: string) => {
  const [results, setResults] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setError(null)
      return
    }

    const debounceTimer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetcher<AutocompleteResponse>(
          `/search?query=${encodeURIComponent(query.trim())}`
        )
        setResults(response.data)
      } catch (err) {
        setError(handleApiError(err))
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(debounceTimer)
  }, [query])

  return { results, loading, error }
}
