import { motion } from 'framer-motion'

export const LoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-12 bg-surface rounded-lg"
        />
      ))}
    </div>
  )
}
