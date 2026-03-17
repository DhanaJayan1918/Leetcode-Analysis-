import { useState, useEffect } from 'react'
import { Student } from '../types/api'
import { fetcher, handleApiError } from '../utils/api'

export const useLeaderboard = (category: 'contest' | 'total' | 'hard') => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await fetcher<Student[]>(`/leaderboard/${category}`)
        setStudents(data)
      } catch (err) {
        setError(handleApiError(err))
        setStudents([])
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [category])

  return { students, loading, error }
}