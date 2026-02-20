import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import InstructorDashboard from './pages/InstructorDashboard'
import ShiftSurvey from './pages/ShiftSurvey'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/instructor" element={<ShiftSurvey />} />
        <Route path="/instructor-inventory" element={<InstructorDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App