import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FileText, Download, BookOpen, ChevronRight, Clock, Award, Info } from 'lucide-react'
import { getAnswers, downloadQuestionPDF } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { AppState } from '../App'
import './SuggestedPaperPage.css'

interface Props {
  state: AppState
  updateState: (p: Partial<AppState>) => void
}

export default function SuggestedPaperPage({ state, updateState }: Props) {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const paper = state.paper!

  const handleGetAnswers = async () => {
    setLoading(true)
    try {
      const answers = await getAnswers(state.sessionId!)
      updateState({ answers })
      await refreshUser()
      toast.success('Answers generated!')
      navigate('/answers')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to generate answers')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    downloadQuestionPDF(state.sessionId!)
    toast.success('Downloading question paper PDF...')
  }

  return (
    <div className="page paper-page">
      {/* Header */}
      <div className="paper-header-section">
        <div className="flex items-center gap-3 mb-2">
          <div className="page-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            <FileText size={20} />
          </div>
          <h2>Predicted Question Paper</h2>
        </div>
        <p>AI-generated paper based on pattern analysis. Review and download below.</p>
        <div className="paper-actions">
          <button
            id="download-paper-btn"
            className="btn btn-secondary"
            onClick={handleDownloadPDF}
          >
            <Download size={16} />
            Download PDF
          </button>
          <button
            id="get-answers-btn"
            className="btn btn-primary"
            onClick={handleGetAnswers}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Generating answers...
              </>
            ) : (
              <>
                <BookOpen size={16} />
                Get Answers
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Question Paper */}
      <div className="question-paper">
        {/* Paper Header */}
        <div className="paper-title-block">
          <h1 className="paper-title">{paper.title}</h1>
          <p className="paper-subject">{paper.subject}</p>
          <div className="paper-meta">
            <div className="meta-item">
              <Award size={14} />
              <span>Total Marks: <strong>{paper.total_marks}</strong></span>
            </div>
            <div className="meta-divider" />
            <div className="meta-item">
              <Clock size={14} />
              <span>Duration: <strong>{paper.duration}</strong></span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {paper.general_instructions.length > 0 && (
          <div className="paper-instructions">
            <div className="instructions-header">
              <Info size={14} />
              <span>General Instructions</span>
            </div>
            <ol className="instructions-list">
              {paper.general_instructions.map((instr, i) => (
                <li key={i}>{instr}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="paper-divider" />

        {/* Sections */}
        {paper.sections.map((section, si) => (
          <div key={si} className="paper-section">
            <div className="section-header-bar">
              <div className="section-name-badge">{section.name}</div>
              <span className="section-marks">{section.total_marks} Marks</span>
            </div>
            {section.instructions && (
              <p className="section-instructions">{section.instructions}</p>
            )}
            <div className="questions-list">
              {section.questions.map((q, qi) => (
                <div key={qi} className="question-item">
                  <div className="question-number">Q{q.number}.</div>
                  <div className="question-body">
                    <p className="question-text">{q.question}</p>
                    <div className="question-meta">
                      <span className="question-topic">{q.topic}</span>
                      <span className="question-marks-badge">
                        [{q.marks} Mark{q.marks !== 1 ? 's' : ''}]
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="paper-footer">
          <p>— End of Question Paper —</p>
          <p className="footer-note">AI-generated prediction based on past paper analysis</p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="paper-bottom-cta">
        <button className="btn btn-secondary" onClick={handleDownloadPDF}>
          <Download size={16} />
          Download Question Paper (PDF)
        </button>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleGetAnswers}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              Generating answers...
            </>
          ) : (
            <>
              <BookOpen size={18} />
              Get Answers for All Questions
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
