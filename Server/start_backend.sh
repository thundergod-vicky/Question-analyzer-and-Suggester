#!/bin/bash
# Start the QuestionAI backend server

cd "$(dirname "$0")"

echo "🚀 Starting QuestionAI Backend..."
echo "📍 API will be available at: http://localhost:8000"
echo "📖 API docs at: http://localhost:8000/docs"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "⚠️  No .env file found. Copying from .env.example..."
  cp .env.example .env
  echo "✏️  Please edit Server/.env and add your OpenAI API key"
fi

uvicorn main:app --reload --host 0.0.0.0 --port 8000
