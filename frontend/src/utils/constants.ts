export const LEADERBOARD_CATEGORIES = {
  CONTEST_RATING: 'contest',
  TOTAL_PROBLEMS: 'total',
  HARD_PROBLEMS: 'hard',
} as const

export const CATEGORY_LABELS = {
  [LEADERBOARD_CATEGORIES.CONTEST_RATING]: 'Contest Rating',
  [LEADERBOARD_CATEGORIES.TOTAL_PROBLEMS]: 'Total Problems',
  [LEADERBOARD_CATEGORIES.HARD_PROBLEMS]: 'Hard Problems',
} as const

export const RANK_COLORS = {
  1: 'accent-gold',
  2: 'accent-silver',
  3: 'accent-bronze',
} as const

export const RANK_BG_COLORS = {
  1: 'bg-amber-500/20',
  2: 'bg-gray-500/20',
  3: 'bg-orange-600/20',
} as const
