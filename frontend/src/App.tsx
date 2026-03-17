import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Navbar } from './components/Navbar'
import { Landing } from './pages/Landing'
import { Leaderboard } from './pages/Leaderboard'
import { StudentProfile } from './pages/StudentProfile'
import { WeeklyAnalysis } from './pages/WeeklyAnalysis'
import './App.css'

function App() {
  return (
    <Router>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/student/:username" element={<StudentProfile />} />
          <Route path="/student/:username/weekly" element={<WeeklyAnalysis />} />
        </Routes>
      </AnimatePresence>
    </Router>
  )
}

export default App
