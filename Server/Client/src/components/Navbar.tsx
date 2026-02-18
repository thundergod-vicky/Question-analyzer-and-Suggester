import { Link, useLocation } from 'react-router-dom'
import { Brain, Upload, BarChart2, FileText, BookOpen, LogOut, User, Coins } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

interface NavbarProps {
  currentStep: number
}

const steps = [
  { path: '/dashboard', label: 'Upload', icon: Upload, step: 1 },
  { path: '/analysis', label: 'Analysis', icon: BarChart2, step: 2 },
  { path: '/paper', label: 'Paper', icon: FileText, step: 3 },
  { path: '/answers', label: 'Answers', icon: BookOpen, step: 4 },
]

export default function Navbar({ currentStep }: NavbarProps) {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <div className="brand-icon">
            <Brain size={20} />
          </div>
          <span className="brand-name">QuestionAI</span>
        </Link>

        <div className="navbar-steps">
          {steps.map((s, i) => {
            const Icon = s.icon
            const isActive = location.pathname === s.path
            const isCompleted = currentStep > s.step
            const isAccessible = currentStep >= s.step

            return (
              <div key={s.path} className="nav-step-wrapper">
                {i > 0 && (
                  <div className={`nav-connector ${isCompleted ? 'completed' : ''}`} />
                )}
                <Link
                  to={isAccessible ? s.path : '#'}
                  className={`nav-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${!isAccessible ? 'locked' : ''}`}
                  onClick={e => !isAccessible && e.preventDefault()}
                >
                  <div className="nav-step-icon">
                    <Icon size={14} />
                  </div>
                  <span className="nav-step-label">{s.label}</span>
                </Link>
              </div>
            )
          })}
        </div>

        <div className="navbar-right">
          <div className="user-credits">
            <Coins size={14} className="credits-icon" />
            <span>{user?.credits_used || 0} Credits</span>
          </div>
          
          <div className="user-profile">
            <div className="user-avatar">
              <User size={16} />
            </div>
            <button onClick={logout} className="logout-btn" title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
