import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts'
import { fetcher } from '../utils/api'

interface WeeklyData {
  week: string
  total_solved: number
  easy: number
  medium: number
  hard: number
  delta_total: number
  delta_easy: number
  delta_medium: number
  delta_hard: number
}

export const WeeklyAnalysis = () => {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) return
    const fetchWeekly = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetcher<{ data: WeeklyData[] }>(
          `/student/${username}/weekly`
        )
        setWeeklyData(res.data)
      } catch {
        setError('Failed to load weekly data')
        setWeeklyData([])
      } finally {
        setLoading(false)
      }
    }
    fetchWeekly()
  }, [username])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  // Summary stats
  const totalDelta = weeklyData.reduce((sum, w) => sum + w.delta_total, 0)
  const avgDelta =
    weeklyData.length > 1
      ? Math.round(totalDelta / (weeklyData.length - 1))
      : 0
  const bestWeek =
    weeklyData.length > 1
      ? weeklyData.slice(1).reduce((best, w) =>
          w.delta_total > best.delta_total ? w : best
        )
      : null

  const DeltaIcon = ({ value }: { value: number }) =>
    value > 0 ? (
      <TrendingUp className="text-green-400" size={18} />
    ) : value < 0 ? (
      <TrendingDown className="text-red-400" size={18} />
    ) : (
      <Minus className="text-gray-400" size={18} />
    )

  const deltaColor = (v: number) =>
    v > 0 ? 'text-green-400' : v < 0 ? 'text-red-400' : 'text-gray-400'

  if (!username) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-text-secondary">Invalid student username</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(`/student/${username}`)}
          className="flex items-center gap-2 text-accent-primary hover:text-accent-secondary transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back to Profile
        </motion.button>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-xl bg-surface/30 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="glass p-8 rounded-xl border border-red-500/50 bg-red-500/10">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Error
            </h2>
            <p className="text-text-secondary">{error}</p>
          </div>
        ) : weeklyData.length === 0 ? (
          <div className="glass-premium p-12 rounded-2xl border border-accent-purple/20 text-center">
            <BarChart3
              size={48}
              className="mx-auto text-accent-purple mb-4"
            />
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              No Weekly Data Yet
            </h2>
            <p className="text-text-secondary">
              Weekly performance data will appear here once there are multiple
              snapshots for <span className="font-mono">@{username}</span>.
            </p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* Header */}
            <motion.div variants={item}>
              <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
                Weekly Performance
              </h1>
              <p className="text-text-muted text-lg">
                @{username} &middot; {weeklyData.length} weeks tracked
              </p>
            </motion.div>

            {/* Summary Cards */}
            <motion.div
              variants={item}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="glass-premium p-6 rounded-2xl border border-green-500/20">
                <p className="text-text-muted text-xs font-bold uppercase tracking-wide mb-2">
                  Total Progress
                </p>
                <div className="flex items-center gap-2">
                  <DeltaIcon value={totalDelta} />
                  <p
                    className={`text-3xl font-display font-bold ${deltaColor(totalDelta)}`}
                  >
                    {totalDelta > 0 ? '+' : ''}
                    {totalDelta}
                  </p>
                </div>
                <p className="text-text-muted text-sm mt-1">problems</p>
              </div>

              <div className="glass-premium p-6 rounded-2xl border border-accent-purple/20">
                <p className="text-text-muted text-xs font-bold uppercase tracking-wide mb-2">
                  Avg / Week
                </p>
                <div className="flex items-center gap-2">
                  <DeltaIcon value={avgDelta} />
                  <p
                    className={`text-3xl font-display font-bold ${deltaColor(avgDelta)}`}
                  >
                    {avgDelta > 0 ? '+' : ''}
                    {avgDelta}
                  </p>
                </div>
                <p className="text-text-muted text-sm mt-1">problems/week</p>
              </div>

              <div className="glass-premium p-6 rounded-2xl border border-accent-secondary/20">
                <p className="text-text-muted text-xs font-bold uppercase tracking-wide mb-2">
                  Best Week
                </p>
                {bestWeek ? (
                  <>
                    <p className="text-3xl font-display font-bold text-accent-secondary">
                      +{bestWeek.delta_total}
                    </p>
                    <p className="text-text-muted text-sm mt-1">
                      {bestWeek.week}
                    </p>
                  </>
                ) : (
                  <p className="text-text-muted text-sm">—</p>
                )}
              </div>
            </motion.div>

            {/* Main Chart — Total Solved + Weekly Delta */}
            <motion.div
              variants={item}
              className="glass-premium p-8 rounded-2xl border border-surface-light/20"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                <TrendingUp size={24} className="text-accent-primary" />
                Weekly Progress
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={weeklyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148, 163, 184, 0.1)"
                  />
                  <XAxis
                    dataKey="week"
                    stroke="#cbd5e1"
                    tick={{ fontSize: 12 }}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#cbd5e1"
                    tick={{ fontSize: 12 }}
                    label={{
                      value: 'Total Solved',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: '#94a3b8', fontSize: 12 },
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#cbd5e1"
                    tick={{ fontSize: 12 }}
                    label={{
                      value: 'Weekly Change',
                      angle: 90,
                      position: 'insideRight',
                      style: { fill: '#94a3b8', fontSize: 12 },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#f1f5f9' }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend
                    wrapperStyle={{ color: '#cbd5e1', paddingTop: '16px' }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="total_solved"
                    name="Total Solved"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="delta_total"
                    name="Weekly Change"
                    radius={[4, 4, 0, 0]}
                  >
                    {weeklyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.delta_total > 0
                            ? '#10b981'
                            : entry.delta_total < 0
                              ? '#ef4444'
                              : '#6b7280'
                        }
                        fillOpacity={0.7}
                      />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Difficulty Breakdown Chart */}
            <motion.div
              variants={item}
              className="glass-premium p-8 rounded-2xl border border-surface-light/20"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                <BarChart3 size={24} className="text-accent-secondary" />
                Difficulty Breakdown (Weekly Change)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={weeklyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148, 163, 184, 0.1)"
                  />
                  <XAxis
                    dataKey="week"
                    stroke="#cbd5e1"
                    tick={{ fontSize: 12 }}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#cbd5e1" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#f1f5f9' }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend
                    wrapperStyle={{ color: '#cbd5e1', paddingTop: '16px' }}
                  />
                  <Bar
                    dataKey="delta_easy"
                    name="Easy Δ"
                    fill="#10b981"
                    radius={[2, 2, 0, 0]}
                    fillOpacity={0.8}
                  />
                  <Bar
                    dataKey="delta_medium"
                    name="Medium Δ"
                    fill="#f59e0b"
                    radius={[2, 2, 0, 0]}
                    fillOpacity={0.8}
                  />
                  <Bar
                    dataKey="delta_hard"
                    name="Hard Δ"
                    fill="#ef4444"
                    radius={[2, 2, 0, 0]}
                    fillOpacity={0.8}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Weekly Detail Table */}
            <motion.div
              variants={item}
              className="glass-premium p-8 rounded-2xl border border-surface-light/20 overflow-x-auto"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                Week-by-Week Details
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-light/20">
                    <th className="text-left text-text-muted font-bold uppercase tracking-wide py-3 px-2">
                      Week
                    </th>
                    <th className="text-right text-text-muted font-bold uppercase tracking-wide py-3 px-2">
                      Total
                    </th>
                    <th className="text-right text-text-muted font-bold uppercase tracking-wide py-3 px-2">
                      Easy
                    </th>
                    <th className="text-right text-text-muted font-bold uppercase tracking-wide py-3 px-2">
                      Medium
                    </th>
                    <th className="text-right text-text-muted font-bold uppercase tracking-wide py-3 px-2">
                      Hard
                    </th>
                    <th className="text-right text-text-muted font-bold uppercase tracking-wide py-3 px-2">
                      Δ Total
                    </th>
                    <th className="text-right text-text-muted font-bold uppercase tracking-wide py-3 px-2">
                      Δ Easy
                    </th>
                    <th className="text-right text-text-muted font-bold uppercase tracking-wide py-3 px-2">
                      Δ Med
                    </th>
                    <th className="text-right text-text-muted font-bold uppercase tracking-wide py-3 px-2">
                      Δ Hard
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyData.map((row, idx) => (
                    <motion.tr
                      key={row.week}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-surface-light/10 hover:bg-surface/20 transition-colors"
                    >
                      <td className="py-3 px-2 text-text-primary font-mono font-medium">
                        {row.week}
                      </td>
                      <td className="py-3 px-2 text-right text-text-primary font-bold">
                        {row.total_solved}
                      </td>
                      <td className="py-3 px-2 text-right text-green-400">
                        {row.easy}
                      </td>
                      <td className="py-3 px-2 text-right text-yellow-400">
                        {row.medium}
                      </td>
                      <td className="py-3 px-2 text-right text-red-400">
                        {row.hard}
                      </td>
                      <td
                        className={`py-3 px-2 text-right font-bold ${deltaColor(row.delta_total)}`}
                      >
                        {row.delta_total > 0 ? '+' : ''}
                        {row.delta_total}
                      </td>
                      <td
                        className={`py-3 px-2 text-right ${deltaColor(row.delta_easy)}`}
                      >
                        {row.delta_easy > 0 ? '+' : ''}
                        {row.delta_easy}
                      </td>
                      <td
                        className={`py-3 px-2 text-right ${deltaColor(row.delta_medium)}`}
                      >
                        {row.delta_medium > 0 ? '+' : ''}
                        {row.delta_medium}
                      </td>
                      <td
                        className={`py-3 px-2 text-right ${deltaColor(row.delta_hard)}`}
                      >
                        {row.delta_hard > 0 ? '+' : ''}
                        {row.delta_hard}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
