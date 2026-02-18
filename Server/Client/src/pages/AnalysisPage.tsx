import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  BarChart2, TrendingUp, Lightbulb, ChevronRight,
  Target, Calendar, Hash, Sparkles
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend
} from 'recharts'
import { motion } from 'framer-motion'
import { generatePaper } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { AppState } from '../App'
import './AnalysisPage.css'

interface Props {
  state: AppState
  updateState: (p: Partial<AppState>) => void
}

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value">{payload[0].value} questions</p>
      </div>
    )
  }
  return null
}

export default function AnalysisPage({ state, updateState }: Props) {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  
  const analysis = state.analysis

  if (!analysis) {
    return (
      <div className="page analysis-page flex flex-col items-center justify-center text-center">
        <div className="card-glass p-8 max-w-md">
          <BarChart2 size={48} className="text-muted mb-4 mx-auto" strokeWidth={1} />
          <h2 className="mb-2">Analysis Data Missing</h2>
          <p className="mb-6">It looks like the session has expired or the page was refreshed. Please upload your papers again.</p>
          <button 
            className="btn btn-primary w-full"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const topTopics = [...analysis.topics]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  const yearData = Object.entries(analysis.year_distribution)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, count]) => ({ year, count }))

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const paper = await generatePaper(state.sessionId!)
      updateState({ paper })
      await refreshUser()
      toast.success('Question paper generated!')
      navigate('/paper')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page analysis-page">
      <div className="section-header">
        <div className="flex items-center gap-3 mb-2">
          <div className="page-icon">
            <BarChart2 size={20} />
          </div>
          <h2>Pattern Analysis</h2>
        </div>
        <p>AI has analyzed {analysis.total_questions} questions across your uploaded papers.</p>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        {[
          { icon: <Hash size={18} />, value: analysis.total_questions, label: 'Total Questions' },
          { icon: <Target size={18} />, value: analysis.topics.length, label: 'Unique Topics' },
          { icon: <Calendar size={18} />, value: Object.keys(analysis.year_distribution).length, label: 'Years Analyzed' },
          { icon: <TrendingUp size={18} />, value: analysis.predicted_topics.length, label: 'Predicted Topics' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="analysis-grid">
        {/* Topic Frequency Chart */}
        <div className="card analysis-card">
          <h3 className="card-title">Topic Frequency</h3>
          <p className="card-subtitle">How often each topic appeared across all papers</p>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topTopics} margin={{ top: 10, right: 10, left: -20, bottom: 60 }}>
                <XAxis
                  dataKey="topic"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {topTopics.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Year Distribution */}
        {yearData.length > 1 && (
          <div className="card analysis-card">
            <h3 className="card-title">Year-wise Distribution</h3>
            <p className="card-subtitle">Number of questions per year</p>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={yearData}
                    dataKey="count"
                    nameKey="year"
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    label={({ year, percent }) => `${year} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={{ stroke: '#64748b' }}
                  >
                    {yearData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`${v} questions`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Predicted Topics */}
      <div className="card predicted-card">
        <div className="predicted-header">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="predicted-icon" />
            <h3>Predicted Topics for This Year</h3>
          </div>
          <span className="badge badge-primary">AI Prediction</span>
        </div>
        <div className="predicted-topics">
          {analysis.predicted_topics.map((topic, i) => (
            <div key={i} className="predicted-topic">
              <span className="topic-rank">#{i + 1}</span>
              <span className="topic-name">{topic}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pattern Insights */}
      <div className="card insights-card">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={18} className="insights-icon" />
          <h3>Pattern Insights</h3>
        </div>
        <div className="insights-list">
          {analysis.pattern_insights.map((insight, i) => (
            <div key={i} className="insight-item">
              <div className="insight-dot" />
              <p>{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="analysis-cta">
        <button
          id="generate-paper-btn"
          className="btn btn-primary btn-lg"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              Generating paper...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate Predicted Paper
              <ChevronRight size={18} />
            </>
          )}
        </button>
        <p className="cta-hint">AI will create a full question paper based on these patterns</p>
      </div>
    </div>
  )
}
