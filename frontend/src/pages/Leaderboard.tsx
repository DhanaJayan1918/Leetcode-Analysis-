import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { LeaderboardTable } from '../components/LeaderboardTable'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { CATEGORY_LABELS, LEADERBOARD_CATEGORIES } from '../utils/constants'

export const Leaderboard = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') || LEADERBOARD_CATEGORIES.CONTEST_RATING

  const [category, setCategory] = useState<
    'contest' | 'total' | 'hard'
  >(categoryParam as any)

  const { students, loading, error } = useLeaderboard(category)

  const handleCategoryChange = (newCategory: 'contest' | 'total' | 'hard') => {
    setCategory(newCategory)
    setSearchParams({ category: newCategory })
  }

  const categories = [
    {
      key: LEADERBOARD_CATEGORIES.CONTEST_RATING,
      label: CATEGORY_LABELS[LEADERBOARD_CATEGORIES.CONTEST_RATING],
    },
    {
      key: LEADERBOARD_CATEGORIES.TOTAL_PROBLEMS,
      label: CATEGORY_LABELS[LEADERBOARD_CATEGORIES.TOTAL_PROBLEMS],
    },
    {
      key: LEADERBOARD_CATEGORIES.HARD_PROBLEMS,
      label: CATEGORY_LABELS[LEADERBOARD_CATEGORIES.HARD_PROBLEMS],
    },
  ]

  const getMetricKey = () => {
    switch (category) {
      case 'contest':
        return 'contest_rating'
      case 'total':
        return 'total_solved'
      case 'hard':
        return 'hard'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-bg px-4 sm:px-6 lg:px-8 py-16 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-0 w-96 h-96 bg-accent-purple opacity-5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-0 w-96 h-96 bg-accent-secondary opacity-5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold gradient-text text-balance">
            Leaderboards
          </h1>
          <p className="text-lg md:text-xl text-text-muted font-medium max-w-2xl mx-auto">
            Track competitive programming performance and climb to the top
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          {categories.map((cat, idx) => (
            <motion.button
              key={cat.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange(cat.key as any)}
              className={`relative px-8 py-4 rounded-2xl font-display font-bold text-lg transition-all duration-300 group overflow-hidden ${
                category === cat.key
                  ? 'bg-gradient-accent text-white shadow-2xl shadow-accent-purple/50'
                  : 'glass-premium border-2 border-accent-purple/20 text-text-secondary hover:border-accent-purple/50 hover:text-text-primary'
              }`}
            >
              {category === cat.key && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-purple -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat.label}</span>
              {category === cat.key && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 border-2 border-white/20 rounded-2xl"
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-premium border-2 border-red-500/30 rounded-2xl p-6 bg-gradient-to-r from-red-500/10 to-transparent"
            >
              <p className="text-red-400 font-bold text-lg">Failed to load leaderboard</p>
              <p className="text-red-300/70 text-sm mt-1">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && <LoadingSpinner />}

        {/* Leaderboard Table */}
        <AnimatePresence mode="wait">
          {!loading && students.length > 0 && (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <LeaderboardTable
                students={students}
                metricKey={getMetricKey() as any}
                metricLabel={categories.find((c) => c.key === category)?.label || ''}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!loading && students.length === 0 && !error && (
          <div className="text-center py-12 text-text-secondary">
            No leaderboard data available
          </div>
        )}
      </div>
    </div>
  )
}
