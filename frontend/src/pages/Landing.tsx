import { motion } from 'framer-motion'
import { SearchBar } from '../components/SearchBar'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const Landing = () => {
  const navigate = useNavigate()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="min-h-screen bg-gradient-bg flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-accent opacity-10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent-purple opacity-5 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-5xl space-y-16 relative z-10"
      >
        {/* Hero Section */}
        <motion.div variants={item} className="text-center space-y-8">
          <div className="inline-block">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-6xl md:text-8xl font-display font-bold gradient-text text-balance leading-tight"
            >
              Competitive Programming Analytics
            </motion.div>
          </div>
          <p className="text-lg md:text-2xl text-text-secondary max-w-3xl mx-auto text-balance font-light leading-relaxed">
            Track rankings, analyze performance, and climb the leaderboards with advanced competitive programming insights
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={item} className="w-full">
          <SearchBar />
        </motion.div>

        {/* Quick Links */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {[
            {
              label: 'Contest Rating',
              desc: 'View top performers by rating',
              onClick: () => navigate('/leaderboard?category=contest'),
              gradient: 'from-accent-primary/20 to-accent-secondary/20',
              icon: '📊',
            },
            {
              label: 'Total Problems',
              desc: 'See who solved the most',
              onClick: () => navigate('/leaderboard?category=total'),
              gradient: 'from-accent-secondary/20 to-accent-tertiary/20',
              icon: '🎯',
            },
            {
              label: 'Hard Problems',
              desc: 'Challenge difficulty rankings',
              onClick: () => navigate('/leaderboard?category=hard'),
              gradient: 'from-accent-orange/20 to-accent-gold/20',
              icon: '⚡',
            },
          ].map((link, idx) => (
            <motion.button
              key={link.label}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={link.onClick}
              className={`glass-premium p-8 rounded-2xl border border-accent-purple/20 bg-gradient-to-br ${link.gradient} group overflow-hidden transition-all duration-300 text-left relative`}
            >
              <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{link.icon}</span>
                    <h3 className="text-xl font-display font-bold text-text-primary group-hover:gradient-text transition-all">
                      {link.label}
                    </h3>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-accent-primary group-hover:translate-x-2 transition-transform duration-300"
                  />
                </div>
                <p className="text-text-muted text-sm font-medium">{link.desc}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={item}
          className="glass-premium p-10 rounded-2xl border border-accent-purple/20 backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { value: '1000+', label: 'Competitors', color: 'text-accent-primary' },
              { value: '50K+', label: 'Problems Solved', color: 'text-accent-secondary' },
              { value: '3', label: 'Leaderboards', color: 'text-accent-gold' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="text-center group"
              >
                <p className={`text-4xl md:text-5xl font-display font-bold ${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.value}
                </p>
                <p className="text-text-muted font-medium text-sm uppercase tracking-wide">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
