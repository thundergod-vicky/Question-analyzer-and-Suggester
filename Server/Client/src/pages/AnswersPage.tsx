import { BookOpen, Download, CheckCircle, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { downloadAnswerPDF, downloadQuestionPDF } from '../api/client'
import type { AppState } from '../App'
import './AnswersPage.css'

interface Props {
  state: AppState
}

export default function AnswersPage({ state }: Props) {
  const navigate = useNavigate()
  const answers = state.answers!

  const handleDownloadAnswers = () => {
    downloadAnswerPDF(state.sessionId!)
    toast.success('Downloading Q&A PDF...')
  }

  const handleDownloadQuestions = () => {
    downloadQuestionPDF(state.sessionId!)
    toast.success('Downloading question paper PDF...')
  }

  const totalMarks = answers.answered_questions.reduce((sum, q) => sum + q.marks, 0)

  return (
    <div className="page answers-page">
      {/* Header */}
      <div className="answers-header">
        <div className="flex items-center gap-3 mb-2">
          <div className="page-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            <BookOpen size={20} />
          </div>
          <h2>Questions & Answers</h2>
        </div>
        <p>{answers.answered_questions.length} questions answered — {totalMarks} total marks</p>

        <div className="answers-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/paper')}>
            <ChevronLeft size={16} />
            Back to Paper
          </button>
          <button className="btn btn-secondary" onClick={handleDownloadQuestions}>
            <Download size={16} />
            Download Question Paper
          </button>
          <button
            id="download-answers-btn"
            className="btn btn-success"
            onClick={handleDownloadAnswers}
          >
            <Download size={16} />
            Download Q&A PDF
          </button>
        </div>
      </div>

      {/* Completion badge */}
      <div className="completion-banner">
        <CheckCircle size={20} />
        <div>
          <strong>Complete Answer Key Ready</strong>
          <p>All {answers.answered_questions.length} questions have been answered with mark-appropriate detail</p>
        </div>
      </div>

      {/* Answers list */}
      <div className="answers-list">
        {answers.answered_questions.map((aq, i) => (
          <div key={i} className="answer-card">
            <div className="answer-card-header">
              <div className="answer-q-num">Q{aq.number}</div>
              <div className="answer-q-info">
                <p className="answer-question">{aq.question}</p>
                <div className="answer-meta">
                  <span className="answer-section-badge">Section {aq.section}</span>
                  <span className="answer-marks-badge">
                    {aq.marks} Mark{aq.marks !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className="answer-body">
              <div className="answer-label">
                <CheckCircle size={13} />
                Answer
              </div>
              <div className="answer-text">
                {aq.answer.split('\n').map((line, li) => (
                  line.trim() ? <p key={li}>{line}</p> : <br key={li} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom download */}
      <div className="answers-bottom-cta">
        <div className="cta-card">
          <div className="cta-card-content">
            <BookOpen size={24} />
            <div>
              <h3>Download Complete Q&A PDF</h3>
              <p>Get all questions and answers in a formatted PDF document</p>
            </div>
          </div>
          <div className="cta-card-actions">
            <button className="btn btn-secondary" onClick={handleDownloadQuestions}>
              <Download size={16} />
              Questions Only
            </button>
            <button className="btn btn-success btn-lg" onClick={handleDownloadAnswers}>
              <Download size={18} />
              Questions + Answers
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
