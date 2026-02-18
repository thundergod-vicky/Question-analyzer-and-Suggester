#!/bin/bash
# Start the QuestionAI frontend dev server

cd "$(dirname "$0")/Client"

echo "🎨 Starting QuestionAI Frontend..."
echo "🌐 App will be available at: http://localhost:5173"
echo ""

npm run dev
