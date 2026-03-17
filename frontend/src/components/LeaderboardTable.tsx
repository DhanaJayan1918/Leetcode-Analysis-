import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Student } from '../types/api'
import { RANK_COLORS, RANK_BG_COLORS } from '../utils/constants'
import { Search } from 'lucide-react'

interface LeaderboardTableProps {
students: Student[]
metricKey: 'contest_rating' | 'total_solved' | 'hard'
metricLabel: string
}

export const LeaderboardTable = ({
students,
metricKey,
metricLabel,
}: LeaderboardTableProps) => {
const [searchQuery, setSearchQuery] = useState('')
const navigate = useNavigate()

// Attach original rank to each student before filtering
const rankedStudents = useMemo(() => {
  return students.map((student, idx) => ({
    ...student,
    originalRank: idx + 1,
  }))
}, [students])

const filteredStudents = useMemo(() => {
  return rankedStudents.filter(
    (student) =>
      (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.username.toLowerCase().includes(searchQuery.toLowerCase())
  )
}, [rankedStudents, searchQuery])

const handleRowClick = (username: string) => {
navigate(`/student/${username}`)
}

const getMetricValue = (student: Student) => {
if (metricKey === 'contest_rating') return student.contest_rating
if (metricKey === 'total_solved') return student.total_solved
return student.hard
}

return ( <div className="space-y-7"> <div className="glass-premium flex items-center gap-4 px-7 py-4 rounded-2xl border-2 border-accent-purple/20"> <Search size={20} className="text-accent-primary flex-shrink-0" />
<input
type="text"
placeholder="Filter by name or username..."
value={searchQuery}
onChange={(e) => setSearchQuery(e.target.value)}
className="flex-1 bg-transparent text-text-primary outline-none text-sm font-medium"
/> </div>

    <div className="overflow-x-auto rounded-2xl border border-accent-purple/20 glass-premium">
      <table className="w-full">
        <thead>
          <tr className="border-b border-accent-purple/20">
            <th className="px-8 py-5 text-left text-xs font-bold">🏆 Rank</th>
            <th className="px-8 py-5 text-left text-xs font-bold">Name</th>
            <th className="hidden md:table-cell px-8 py-5 text-left text-xs font-bold">
              Username
            </th>
            <th className="px-8 py-5 text-right text-xs font-bold">
              {metricLabel}
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredStudents.map((student) => {
            const rank = student.originalRank
            const rankColor =
              RANK_COLORS[rank as keyof typeof RANK_COLORS] || ''
            const rankBg =
              RANK_BG_COLORS[rank as keyof typeof RANK_BG_COLORS] || ''

            return (
              <motion.tr
                key={student.username}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => handleRowClick(student.username)}
                className={`cursor-pointer border-b border-accent-purple/10 ${
                  rank <= 3 ? rankBg : ''
                }`}
              >
                <td className={`px-8 py-5 font-bold ${rankColor}`}>
                  {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
                </td>

                <td className="px-8 py-5">
                  {student.name || 'Unknown'}
                </td>

                <td className="hidden md:table-cell px-8 py-5 text-text-muted">
                  @{student.username}
                </td>

                <td className="px-8 py-5 text-right font-bold">
                  {getMetricValue(student)}
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>

    {filteredStudents.length === 0 && (
      <div className="text-center py-10 text-text-muted">
        No students found matching your search.
      </div>
    )}
</div>

)
}

