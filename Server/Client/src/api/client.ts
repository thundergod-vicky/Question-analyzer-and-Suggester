import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 min for AI calls
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface User {
  id: number
  email: string
  credits_used: number
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface UploadResponse {
  session_id: string
  files_processed: number
  extracted_text: string[]
  credits_used: number
  message: string
}

// ... TopicFrequency, AnalysisResult, GeneratedQuestion, GeneratedSection, GeneratedPaper, AnsweredQuestion, AnswerSet interfaces remain the same ...
export interface TopicFrequency {
  topic: string
  count: number
  years: string[]
  percentage: number
}

export interface AnalysisResult {
  session_id: string
  total_questions: number
  topics: TopicFrequency[]
  year_distribution: Record<string, number>
  predicted_topics: string[]
  pattern_insights: string[]
  all_questions: {
    question: string
    marks: number
    topic: string
    year?: string
    section?: string
  }[]
}

export interface GeneratedQuestion {
  number: number
  question: string
  marks: number
  section: string
  topic: string
}

export interface GeneratedSection {
  name: string
  instructions: string
  questions: GeneratedQuestion[]
  total_marks: number
}

export interface GeneratedPaper {
  session_id: string
  title: string
  subject: string
  total_marks: number
  duration: string
  general_instructions: string[]
  sections: GeneratedSection[]
}

export interface AnsweredQuestion {
  number: number
  question: string
  marks: number
  section: string
  answer: string
}

export interface AnswerSet {
  session_id: string
  title: string
  answered_questions: AnsweredQuestion[]
}

// Auth methods
export const login = async (formData: FormData): Promise<AuthResponse> => {
  const { data } = await api.post('/auth/login', formData)
  return data
}

export const register_user = async (email: string, password: string): Promise<User> => {
  const { data } = await api.post('/auth/register', { email, password })
  return data
}

export const getMe = async (): Promise<User> => {
  const { data } = await api.get('/auth/me')
  return data
}

// Existing methods
export const uploadFiles = async (files: File[], apiKey?: string): Promise<UploadResponse> => {
  const formData = new FormData()
  files.forEach(f => formData.append('files', f))
  if (apiKey) formData.append('api_key', apiKey)
  const { data } = await api.post('/upload', formData)
  return data
}

export const analyzePapers = async (sessionId: string): Promise<AnalysisResult> => {
  const { data } = await api.post('/analyze', { session_id: sessionId })
  return data
}

export const generatePaper = async (sessionId: string): Promise<GeneratedPaper> => {
  const { data } = await api.post('/generate', { session_id: sessionId })
  return data
}

export const getAnswers = async (sessionId: string): Promise<AnswerSet> => {
  const { data } = await api.post('/answers', { session_id: sessionId })
  return data
}

export const downloadQuestionPDF = async (sessionId: string) => {
  try {
    const { data } = await api.get(`/pdf/questions/${sessionId}`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Question_Paper_${sessionId}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download failed:', error)
    throw error
  }
}

export const downloadAnswerPDF = async (sessionId: string) => {
  try {
    const { data } = await api.get(`/pdf/answers/${sessionId}`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Answers_${sessionId}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download failed:', error)
    throw error
  }
}

export default api
