import { motion } from 'framer-motion'

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  accent?: 'primary' | 'secondary' | 'gold' | 'purple' | 'orange'
}

export const StatCard = ({
  label,
  value,
  icon,
  accent = 'primary',
}: StatCardProps) => {
  const colorMap = {
    primary: { text: 'text-accent-primary', gradient: 'from-accent-primary/20 to-accent-secondary/10' },
    secondary: { text: 'text-accent-secondary', gradient: 'from-accent-secondary/20 to-accent-tertiary/10' },
    gold: { text: 'text-accent-gold', gradient: 'from-accent-gold/20 to-accent-orange/10' },
    purple: { text: 'text-accent-purple', gradient: 'from-accent-purple/20 to-accent-secondary/10' },
    orange: { text: 'text-accent-orange', gradient: 'from-accent-orange/20 to-accent-gold/10' },
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`glass-premium p-8 rounded-2xl border border-accent-purple/20 group overflow-hidden relative`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[accent].gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative z-10">
        <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-3">{label}</p>
        <div className="flex items-center justify-between">
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`text-4xl md:text-5xl font-display font-bold ${colorMap[accent].text} drop-shadow-lg`}
          >
            {value}
          </motion.p>
          {icon && (
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-5xl opacity-60 group-hover:opacity-100 transition-opacity duration-300"
            >
              {icon}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
