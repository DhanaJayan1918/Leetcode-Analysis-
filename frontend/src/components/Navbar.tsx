import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, Home } from 'lucide-react'
import { CATEGORY_LABELS, LEADERBOARD_CATEGORIES } from '../utils/constants'

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleNavigation = (category: string) => {
    navigate(`/leaderboard?category=${category}`)
    setDropdownOpen(false)
    setIsOpen(false)
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

  return (
    <nav className="sticky top-0 z-50 glass-premium border-b border-accent-purple/10 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-gradient-accent rounded-lg blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-9 h-9 bg-gradient-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">
                <Home size={18} />
              </div>
            </div>
            <span className="text-2xl font-display font-bold gradient-text">Home</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-medium transition-all duration-300 hover:gap-3"
              >
                Leaderboards
                <motion.div
                  animate={{ rotate: dropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={18} />
                </motion.div>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-3 glass-premium border border-accent-purple/20 rounded-xl overflow-hidden min-w-56 shadow-glass"
                  >
                    {categories.map((cat, idx) => (
                      <motion.button
                        key={cat.key}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleNavigation(cat.key)}
                        className="w-full text-left px-5 py-3.5 text-text-secondary hover:text-text-primary font-medium transition-all duration-200 hover:bg-accent-purple/10 hover:translate-x-1 border-b border-accent-purple/5 last:border-b-0"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-purple opacity-0 group-hover:opacity-100 transition-opacity" />
                          {cat.label}
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-text-primary hover:text-accent-primary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-accent-purple/10 bg-gradient-to-b from-accent-purple/5 to-transparent"
            >
              <div className="px-4 py-6 space-y-3">
                <p className="text-text-muted text-xs font-bold uppercase tracking-wider">
                  Leaderboards
                </p>
                {categories.map((cat) => (
                  <motion.button
                    key={cat.key}
                    whileHover={{ x: 4 }}
                    onClick={() => handleNavigation(cat.key)}
                    className="block w-full text-left px-4 py-3 text-text-secondary hover:text-text-primary font-medium rounded-lg hover:bg-accent-purple/10 transition-all duration-200"
                  >
                    {cat.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
