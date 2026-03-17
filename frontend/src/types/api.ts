export interface Student {
  username: string
  name: string
  total_solved: number
  easy_solved: number
  medium_solved: number
  hard_solved: number
  hard: number
  contest_rating: number
  global_rank: number
  ranking: number
  _id?: string
}

export interface LeaderboardEntry {
  rank: number
  username: string
  name: string
  score: number
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[]
  total: number
}

export interface StudentProfileResponse {
  data: Student
}

export interface AutocompleteResponse {
  data: Student[]
}

export interface ApiError {
  message: string
  status: number
}
