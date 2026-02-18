# QuestionAI - Predictive Exam Paper Analyzer

QuestionAI is a sophisticated full-stack platform that leverages Neural Networks to analyze institutional past papers (PDFs and Images), identify semantic recurring patterns, and generate high-probability predicted question papers for upcoming exams.

![Dashboard Preview](https://via.placeholder.com/1200x600?text=QuestionAI+Holographic+Dashboard)

## 🚀 Key Features

- **Holographic Dashboard**: 3D-tilted, real-time visualization of neural engine status and performance metrics.
- **Quantum OCR**: Extracts LaTeX formulas, complex diagrams, and multi-column structured text from poor-quality scans.
- **Neural Synthesis Engine**: AI-driven pattern recognition that clusters data points across 10+ years of exam papers.
- **Smart Paper Generation**: Instant synthesis of predicted papers with mark-based answer keys.
- **Security-First Architecture**: Institutional-grade document handling within a secure enclave.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Framer Motion, Lucide Icons, Recharts.
- **Backend**: FastAPI (Python 3.10+), Pydantic, PyMuPDF (OCR & Parsing), OpenAI GPT-4o integration.
- **Styling**: Vanilla CSS3 with Glassmorphism and Neon design systems.

## 📦 Project Structure

```bash
├── Server/                 # FastAPI Backend
│   ├── main.py             # Entry point
│   ├── Client/             # React Frontend (Vite)
│   ├── routers/            # API Endpoints
│   ├── services/           # AI & OCR Logic
│   └── requirements.txt    # Python dependencies
└── .gitignore              # Unified git rules
```

## ⚙️ Setup & Installation

### 1. Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- OpenAI API Key

### 2. Backend Setup (Server)

Navigate to the `Server` directory:

```bash
cd Server
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

Create a `.env` file in the `Server` folder:

```env
OPENAI_API_KEY=your_key_here
SECRET_KEY=your_jwt_secret
DATABASE_URL=sqlite:///./test.db
```

Start the server:

```bash
uvicorn main:app --reload
```

### 3. Frontend Setup (Client)

Navigate to the `Client` directory (inside Server):

```bash
cd Server/Client
npm install
```

Start the development server:

```bash
npm run dev
```

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by [Souvik Basu](https://github.com/souvikbasu)
