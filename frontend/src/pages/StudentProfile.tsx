import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStudent } from '../hooks/useStudent'
import { StudentCard } from '../components/StudentCard'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { ArrowLeft, ExternalLink, Clock, TrendingUp, Trophy, Target, Award, Zap } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, PieChart, Pie } from 'recharts'
import { fetcher } from '../utils/api'

interface RecentSubmission {
  title: string
  titleSlug: string
  timestamp: string
  lang: string
}

interface ContestHistoryData {
  attended: boolean;
  rating: number;
  ranking: number;
  trendDirection: string;
  problemsSolved: number;
  totalProblems: number;
  finishTimeInSeconds: number;
  contest: {
    title: string;
    startTime: number;
  };
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

  const [contestHistory, setContestHistory] = useState<ContestHistoryData[]>([])
  const [contestLoading, setContestLoading] = useState(true)

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

    const fetchContest = async () => {
      setContestLoading(true)
      try {
        const res = await fetcher<{ data: ContestHistoryData[] }>(`/student/${username}/contest-history`)
        setContestHistory(res.data)
      } catch {
        setContestHistory([])
      } finally {
        setContestLoading(false)
      }
    }
    fetchContest()
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

  const pieData = [
    { name: 'Easy', value: student.easy_solved, fill: '#10b981' },
    { name: 'Medium', value: student.medium_solved, fill: '#f59e0b' },
    { name: 'Hard', value: student.hard_solved, fill: '#ef4444' },
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
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="relative w-full md:w-1/2 h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={4}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity focus:outline-none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                      itemStyle={{ color: '#f1f5f9' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-black text-text-primary tracking-tight">{student.total_solved}</span>
                  <span className="text-sm font-medium text-text-muted mt-1 uppercase tracking-wider">Solved</span>
                </div>
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                {pieData.map((category) => (
                  <div key={category.name} className="bg-surface/30 p-4 rounded-xl border border-surface-light/10 hover:bg-surface/40 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: category.fill, boxShadow: `0 0 10px ${category.fill}` }} />
                        <span className="text-text-primary font-semibold tracking-wide">{category.name}</span>
                      </div>
                      <span className="text-text-primary font-bold text-xl">{category.value}</span>
                    </div>
                    <div className="w-full bg-surface-light/20 h-2.5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${student.total_solved > 0 ? (category.value / student.total_solved) * 100 : 0}%` }}
                        transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: category.fill }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contest Rating History Graph */}
          <motion.div
            variants={item}
            className="glass p-8 rounded-xl border border-surface-light/20"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
              <Trophy size={24} className="text-yellow-500" />
              Contest History
            </h2>
            {contestLoading ? (
              <div className="h-[300px] w-full flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-surface border-t-accent-primary animate-spin" />
              </div>
            ) : contestHistory.length > 0 ? (
              <div className="relative w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={contestHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.05)" vertical={false} />
                    <XAxis 
                      dataKey={(val) => val.contest.title.replace('Weekly Contest ', 'W').replace('Biweekly Contest ', 'B')} 
                      stroke="#64748b" 
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={20}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      domain={['dataMin - 50', 'dataMax + 50']}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => Math.round(val).toString()}
                    />
                    <Tooltip
                      cursor={{ stroke: 'rgba(139, 92, 246, 0.2)', strokeWidth: 2, strokeDasharray: '4 4' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as ContestHistoryData;
                          const ratingColor = data.rating >= 2000 ? 'text-red-500' : data.rating >= 1600 ? 'text-blue-500' : 'text-green-500';
                          return (
                            <div className="bg-surface/90 backdrop-blur-md border border-surface-light/20 p-4 rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.15)] relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-accent-primary" />
                              <p className="font-bold text-text-primary mb-4 text-sm tracking-wide">{data.contest.title}</p>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center gap-8">
                                  <span className="text-text-muted text-xs uppercase tracking-wider font-semibold">Rating</span>
                                  <span className={`font-black text-lg ${ratingColor} drop-shadow-md`}>{Math.round(data.rating)}</span>
                                </div>
                                <div className="flex justify-between items-center gap-8">
                                  <span className="text-text-muted text-xs uppercase tracking-wider font-semibold">Global Rank</span>
                                  <span className="font-bold text-text-secondary">#{data.ranking.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center gap-8">
                                  <span className="text-text-muted text-xs uppercase tracking-wider font-semibold">Problems</span>
                                  <span className="font-bold text-accent-primary">
                                    {data.problemsSolved} <span className="text-text-muted">/ {data.totalProblems}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="rating" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRating)" 
                      activeDot={{ r: 6, fill: '#1e293b', stroke: '#8b5cf6', strokeWidth: 3, style: { filter: 'drop-shadow(0px 0px 5px rgba(139, 92, 246, 0.8))' } }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-text-muted">
                No contest history available
              </div>
            )}
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

          {/* Advanced Statistics Grid */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative glass-premium p-6 rounded-2xl border border-accent-primary/20 hover:border-accent-primary/50 transition-all duration-300 overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-accent-primary/10 rounded-full blur-2xl group-hover:bg-accent-primary/20 transition-all duration-500" />
              <div className="relative z-10 flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <Target size={24} className="text-accent-primary" />
                </div>
                <p className="text-text-secondary font-semibold tracking-wide uppercase text-sm">Total Solved</p>
              </div>
              <div className="relative z-10 flex items-end gap-3">
                <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-text-secondary drop-shadow-sm">
                  {student.total_solved}
                </p>
                <div className="flex items-center gap-1.5 mb-1.5 px-2.5 py-0.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-accent-primary text-[10px] font-bold uppercase tracking-wider">Problems</span>
                </div>
              </div>
            </div>

            <div className="group relative glass-premium p-6 rounded-2xl border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all duration-500" />
              <div className="relative z-10 flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                  <Award size={24} className="text-yellow-500" />
                </div>
                <p className="text-text-secondary font-semibold tracking-wide uppercase text-sm">Contest Rating</p>
              </div>
              <div className="relative z-10 flex items-end gap-3">
                <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-text-secondary drop-shadow-sm">
                  {Math.round(student.contest_rating)}
                </p>
                <div className="flex items-center gap-1.5 mb-1.5 px-2.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                  <span className="text-yellow-500 text-[10px] font-bold uppercase tracking-wider">Global Elo</span>
                </div>
              </div>
            </div>

            <div className="group relative glass-premium p-6 rounded-2xl border border-accent-purple/20 hover:border-accent-purple/50 transition-all duration-300 overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-accent-purple/10 rounded-full blur-2xl group-hover:bg-accent-purple/20 transition-all duration-500" />
              <div className="relative z-10 flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent-purple/10 flex items-center justify-center border border-accent-purple/20 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                  <Zap size={24} className="text-accent-purple" />
                </div>
                <p className="text-text-secondary font-semibold tracking-wide uppercase text-sm">Solve Rate</p>
              </div>
              <div className="relative z-10 flex items-end gap-3">
                <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-text-secondary drop-shadow-sm">
                  {Math.round((student.total_solved / 3000) * 100)}%
                </p>
                <div className="flex items-center gap-1.5 mb-1.5 px-2.5 py-0.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-purple shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                  <span className="text-accent-purple text-[10px] font-bold uppercase tracking-wider">Completion</span>
                </div>
              </div>
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

