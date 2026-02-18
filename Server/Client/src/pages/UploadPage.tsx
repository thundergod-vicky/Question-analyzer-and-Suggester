import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Upload, X, FileText, Image, Sparkles, ChevronRight, Coins } from 'lucide-react'
import { uploadFiles, analyzePapers } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { AppState } from '../App'

import './UploadPage.css'

interface Props {
  state: AppState
  updateState: (p: Partial<AppState>) => void
}

export default function UploadPage({ state, updateState }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const onDrop = useCallback((accepted: File[]) => {
    // ... same logic ...
    const combined = [...files, ...accepted].slice(0, 10)
    setFiles(combined)
    if (accepted.length > 0) toast.success(`${accepted.length} file(s) added`)
  }, [files])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 10,
    onDropRejected: () => toast.error('Only PDF and image files are accepted (max 10)'),
  })

  const removeFile = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleAnalyze = async () => {
    if (!files.length) return toast.error('Please upload at least one question paper')

    setLoading(true)
    try {
      setLoadingStep('Extracting text from papers...')
      const uploadRes = await uploadFiles(files)
      updateState({ sessionId: uploadRes.session_id })

      setLoadingStep('AI is analyzing question patterns...')
      const analysis = await analyzePapers(uploadRes.session_id)
      updateState({ analysis })

      // Update global user credits after AI call
      await refreshUser()

      toast.success('Analysis complete!')
      navigate('/analysis')
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err.message || 'Something went wrong'
      toast.error(msg)
    } finally {
      setLoading(false)
      setLoadingStep('')
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return <FileText size={18} />
    return <Image size={18} />
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="page upload-page">
      {/* Hero */}
      <div className="upload-hero">
        <div className="hero-badge">
          <Sparkles size={14} />
          <span>AI Dashboard</span>
        </div>
        <h1>
          Predict Your <span className="gradient-text">Next Exam Paper</span>
        </h1>
        <p className="hero-subtitle">
          Upload 1–10 past question papers. Our AI analyzes patterns, identifies trends,
          and generates a predicted question paper with complete answers.
        </p>
      </div>

      <div className="upload-grid">
        {/* Dropzone */}
        <div className="upload-main">
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'drag-active' : ''} ${files.length >= 10 ? 'disabled' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="dropzone-content">
              <div className="dropzone-icon">
                <Upload size={32} />
              </div>
              {isDragActive ? (
                <p className="dropzone-text">Drop your files here...</p>
              ) : (
                <>
                  <p className="dropzone-text">
                    Drag & drop question papers here
                  </p>
                  <p className="dropzone-text small">
                    or <span>click to browse</span>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="file-list">
              <div className="file-list-header">
                <span>{files.length} file{files.length !== 1 ? 's' : ''} selected</span>
                <button className="btn-text" onClick={() => setFiles([])}>Clear all</button>
              </div>
              {files.map((file, i) => (
                <div key={i} className="file-item">
                  <div className="file-icon">{getFileIcon(file)}</div>
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatSize(file.size)}</span>
                  </div>
                  <button className="file-remove" onClick={() => removeFile(i)}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Config panel */}
        <div className="upload-sidebar">
          <div className="card-glass">
            <div className="sidebar-section">
              <h3 className="sidebar-title">Credit Info</h3>
              <div className="credit-info-box">
                <div className="credit-line">
                  <Coins size={14} />
                  <span>1 credit per file (if vision needed)</span>
                </div>
                <div className="credit-line">
                  <Sparkles size={14} />
                  <span>1 credit per analysis</span>
                </div>
              </div>
            </div>

            <div className="divider" />

            <button
              id="analyze-btn"
              className="btn btn-primary btn-lg w-full"
              onClick={handleAnalyze}
              disabled={loading || !files.length}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analyze Papers
                  <ChevronRight size={18} />
                </>
              )}
            </button>

            {loading && (
              <p className="loading-hint">{loadingStep}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
