import { useState, useEffect } from 'react'
import { Student } from '../types/api'
import { fetcher, handleApiError } from '../utils/api'

export const useStudent = (username: string) => {
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) {
      setStudent(null)
      setLoading(false)
      return
    }

    const fetchStudent = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetcher<Student>(
          `/student/${username}`
        )
        setStudent(response)
      } catch (err) {
        setError(handleApiError(err))
        setStudent(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [username])

  return { student, loading, error }
}

