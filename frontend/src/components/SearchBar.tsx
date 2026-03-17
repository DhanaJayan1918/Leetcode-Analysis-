import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2 } from 'lucide-react'
import { useAutocomplete } from '../hooks/useAutocomplete'

export const SearchBar = () => {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const { results, loading } = useAutocomplete(query)
  const navigate = useNavigate()

  const handleSelect = (username: string) => {
    navigate(`/student/${username}`)
    setQuery('')
    setIsFocused(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (results.length > 0) {
      handleSelect(results[0].username)
    }
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`glass-premium flex items-center gap-4 px-8 py-5 rounded-2xl border-2 transition-all duration-300 ${
            isFocused
              ? 'border-accent-purple shadow-2xl shadow-accent-purple/30'
              : 'border-accent-purple/20 shadow-lg shadow-accent-purple/10'
          }`}
        >
          <motion.div
            animate={isFocused ? { scale: 1.2, color: '#8b5cf6' } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Search size={24} className="text-accent-primary flex-shrink-0" />
          </motion.div>
          <input
            type="text"
            placeholder="Search by username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className="flex-1 bg-transparent text-text-primary placeholder-text-muted outline-none font-medium text-lg"
          />
          {loading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 size={24} className="text-accent-purple" />
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {isFocused && query && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 glass border border-surface-light/20 rounded-xl overflow-hidden z-10"
            >
              {results.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {results.map((student, idx) => (
                    <motion.button
                      key={student.username}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleSelect(student.username)}
                      className="w-full text-left px-6 py-3 hover:bg-surface/50 transition-colors border-b border-surface-light/20 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-text-primary font-medium">
                            {student.name}
                          </p>
                          <p className="text-text-secondary text-sm">
                            @{student.username}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-accent-primary font-bold">
                            {student.total_solved}
                          </p>
                          <p className="text-text-secondary text-xs">solved</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-text-secondary">
                  No results found
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
}
