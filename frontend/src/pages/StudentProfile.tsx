import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStudent } from '../hooks/useStudent'
import { StudentCard } from '../components/StudentCard'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { ArrowLeft, ExternalLink, Clock, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fetcher } from '../utils/api'

interface RecentSubmission {
  title: string
  titleSlug: string
  timestamp: string
  lang: string
}

const formatTimeAgo = (timestamp: string) => {
  const seconds = Math.floor(Date.now() / 1000 - parseInt(timestamp))
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

const langColors: Record<string, string> = {
  python3: 'bg-yellow-500/20 text-yellow-400',
  python: 'bg-yellow-500/20 text-yellow-400',
  java: 'bg-orange-500/20 text-orange-400',
  cpp: 'bg-blue-500/20 text-blue-400',
  c: 'bg-blue-500/20 text-blue-400',
  javascript: 'bg-yellow-300/20 text-yellow-300',
  typescript: 'bg-blue-400/20 text-blue-300',
  golang: 'bg-cyan-500/20 text-cyan-400',
  rust: 'bg-orange-600/20 text-orange-500',
  mysql: 'bg-blue-600/20 text-blue-400',
}

export const StudentProfile = () => {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { student, loading, error } = useStudent(username || '')
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([])
  const [recentLoading, setRecentLoading] = useState(true)

  useEffect(() => {
    if (!username) return
    const fetchRecent = async () => {
      setRecentLoading(true)
      try {
        const res = await fetcher<{ data: RecentSubmission[] }>(`/student/${username}/recent`)
        setRecentSubmissions(res.data)
      } catch {
        setRecentSubmissions([])
      } finally {
        setRecentLoading(false)
      }
    }
    fetchRecent()
  }, [username])

  if (!username) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-text-secondary">Invalid student username</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-accent-primary hover:text-accent-secondary transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          <div className="glass p-8 rounded-xl border border-red-500/50 bg-red-500/10">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Student Not Found
            </h2>
            <p className="text-text-secondary">
              Could not find student with username: <span className="font-mono">@{username}</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-accent-primary hover:text-accent-secondary transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  if (!student) {
    return null
  }

  const chartData = [
    {
      difficulty: 'Easy',
      solved: student.easy_solved,
      fill: '#10b981',
    },
    {
      difficulty: 'Medium',
      solved: student.medium_solved,
      fill: '#f59e0b',
    },
    {
      difficulty: 'Hard',
      solved: student.hard_solved,
      fill: '#ef4444',
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="min-h-screen gradient-bg px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-accent-primary hover:text-accent-secondary transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Go Back
        </motion.button>

        {/* Main Content */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Student Card */}
          <motion.div variants={item}>
            <StudentCard student={student} />
          </motion.div>

          {/* Difficulty Breakdown */}
          <motion.div
            variants={item}
            className="glass p-8 rounded-xl border border-surface-light/20"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Difficulty Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="difficulty" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f1f5f9' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="solved" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Weekly Analysis Link */}
          <motion.div variants={item}>
            <button
              onClick={() => navigate(`/student/${username}/weekly`)}
              className="w-full glass-premium p-6 rounded-2xl border border-accent-purple/20 hover:border-accent-purple/40 transition-all duration-300 group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-display font-bold text-text-primary group-hover:gradient-text transition-all">Weekly Performance Analysis</h3>
                  <p className="text-text-muted text-sm">Track week-over-week improvement & progress</p>
                </div>
              </div>
              <ArrowLeft size={20} className="text-accent-primary rotate-180 group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>

          {/* Statistics Grid */}
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="glass p-4 rounded-lg border border-surface-light/20">
              <p className="text-text-secondary text-xs md:text-sm mb-2">Total Solved</p>
              <p className="text-2xl md:text-3xl font-bold text-accent-primary">
                {student.total_solved}
              </p>
            </div>
            <div className="glass p-4 rounded-lg border border-surface-light/20">
              <p className="text-text-secondary text-xs md:text-sm mb-2">Contest Rating</p>
              <p className="text-2xl md:text-3xl font-bold text-accent-secondary">
                {student.contest_rating}
              </p>
            </div>
            <div className="glass p-4 rounded-lg border border-surface-light/20">
              <p className="text-text-secondary text-xs md:text-sm mb-2">Solve Rate</p>
              <p className="text-2xl md:text-3xl font-bold text-accent-primary">
                {Math.round((student.total_solved / 3000) * 100)}%
              </p>
            </div>
          </motion.div>

          {/* Recently Solved Problems */}
          <motion.div
            variants={item}
            className="glass p-8 rounded-xl border border-surface-light/20"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
              <Clock size={24} className="text-accent-purple" />
              Recently Solved Problems
            </h2>
            {recentLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-surface/30 animate-pulse" />
                ))}
              </div>
            ) : recentSubmissions.length > 0 ? (
              <div className="space-y-2">
                {recentSubmissions.map((sub, idx) => {
                  const colorClass = langColors[sub.lang] || 'bg-gray-500/20 text-gray-400'
                  return (
                    <motion.a
                      key={`${sub.titleSlug}-${idx}`}
                      href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex items-center justify-between p-4 rounded-xl border border-surface-light/10 hover:border-accent-purple/30 hover:bg-surface/30 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="text-text-muted text-sm font-mono w-6 flex-shrink-0">
                          {idx + 1}.
                        </span>
                        <p className="text-text-primary font-medium truncate group-hover:text-accent-primary transition-colors">
                          {sub.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${colorClass}`}>
                          {sub.lang}
                        </span>
                        <span className="text-text-muted text-xs whitespace-nowrap">
                          {formatTimeAgo(sub.timestamp)}
                        </span>
                        <ExternalLink size={14} className="text-text-muted group-hover:text-accent-primary transition-colors" />
                      </div>
                    </motion.a>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted">
                No recent submissions found
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

