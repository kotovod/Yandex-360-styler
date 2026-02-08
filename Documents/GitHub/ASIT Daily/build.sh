#!/bin/bash

echo "🚀 Building ASIT Diary..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build

# Build backend
echo "📦 Building backend..."
cd ../backend
npm install
npm run build

echo "✅ Build complete!"
echo ""
echo "To run locally:"
echo "  Backend: cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "To deploy:"
echo "  Frontend: Deploy frontend/dist to Vercel/Netlify"
echo "  Backend: Deploy backend to Railway/Render/Heroku"
