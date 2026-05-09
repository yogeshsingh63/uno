#!/bin/bash

echo "🚀 Setting up local development environment..."

# 1. Install dependencies for server
echo "📦 Installing server dependencies..."
cd apps/server
npm install
cd ../..

# 2. Install dependencies for mobile
echo "📦 Installing mobile dependencies..."
cd apps/mobile
npm install --legacy-peer-deps
cd ../..

# 3. Setup environment variables
echo "⚙️ Configuring environment variables..."
cat <<EOF > apps/mobile/.env
# The app automatically detects your machine's IP for mobile, and uses localhost for web.
EXPO_PUBLIC_SERVER_URL=http://localhost:8082
EOF

echo "✅ Environment setup complete!"

# 4. Start both servers concurrently
echo "🔥 Starting Backend API (Port 8082) and Mobile Web Frontend (Port 3002)..."
npx concurrently -c "green,blue" -n "SERVER,MOBILE" \
  "cd apps/server && PORT=8082 npm run dev" \
  "cd apps/mobile && npx expo start --web --port 3002"
