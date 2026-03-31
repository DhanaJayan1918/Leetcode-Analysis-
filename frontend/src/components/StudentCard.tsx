import { Student } from '../types/api'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

interface StudentCardProps {
  student: Student
}

export const StudentCard = ({ student }: StudentCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-premium p-10 rounded-3xl border border-accent-purple/20 overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/5 to-accent-secondary/5 pointer-events-none" />
      <div className="relative z-10 flex flex-col gap-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border-b border-accent-purple/20 pb-6"
        >
          <h1 className="text-5xl md:text-6xl font-display font-bold gradient-text mb-3">{student.name}</h1>
          <div className="flex items-center gap-2">
            <p className="text-text-muted text-lg font-medium">@{student.username}</p>
            <a 
              href={`https://leetcode.com/u/${student.username}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-accent-primary transition-colors flex items-center gap-1.5 text-sm bg-surface/30 px-3 py-1 rounded-full border border-surface-light/10 ml-2"
            >
              <ExternalLink size={14} />
              <span>View Profile</span>
            </a>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-5">
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="glass-premium p-6 rounded-2xl border border-accent-secondary/20 bg-gradient-to-br from-accent-secondary/10 to-transparent group"
          >
            <p className="text-text-muted text-sm font-bold uppercase tracking-wide mb-2">Contest Rating</p>
            <p className="text-4xl font-display font-bold text-accent-secondary group-hover:scale-110 transition-transform duration-300">
              {student.contest_rating}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="glass-premium p-6 rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/15 to-transparent group text-center"
          >
            <p className="text-text-muted text-xs md:text-sm font-bold uppercase tracking-wide mb-2">Easy</p>
            <p className="text-3xl md:text-4xl font-display font-bold text-green-400 group-hover:scale-110 transition-transform duration-300">
              {student.easy_solved}
            </p>
          </motion.div>
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="glass-premium p-6 rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/15 to-transparent group text-center"
          >
            <p className="text-text-muted text-xs md:text-sm font-bold uppercase tracking-wide mb-2">Medium</p>
            <p className="text-3xl md:text-4xl font-display font-bold text-yellow-400 group-hover:scale-110 transition-transform duration-300">
              {student.medium_solved}
            </p>
          </motion.div>
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="glass-premium p-6 rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/15 to-transparent group text-center"
          >
            <p className="text-text-muted text-xs md:text-sm font-bold uppercase tracking-wide mb-2">Hard</p>
            <p className="text-3xl md:text-4xl font-display font-bold text-red-400 group-hover:scale-110 transition-transform duration-300">
              {student.hard_solved}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-premium p-7 rounded-2xl border border-accent-purple/20"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-text-muted font-bold uppercase tracking-wide text-sm">Total Solved</p>
            <p className="bg-gradient-accent bg-clip-text text-transparent font-display font-bold text-lg">
              {student.total_solved} / 3000
            </p>
          </div>
          <div className="w-full bg-surface/50 rounded-full h-5 overflow-hidden border border-accent-purple/20">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(student.total_solved / 3000) * 100}%` }}
              transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-purple shadow-lg shadow-accent-purple/50 flex items-center justify-end px-2 min-w-[40px]"
            >
              <span className="text-[10px] font-bold text-white drop-shadow-md">
                {student.total_solved}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
