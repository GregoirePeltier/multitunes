#!/bin/bash

# Exit on error
set -e

echo "🎵 Setting up Music Quiz Project..."

# Check for required tools
check_requirements() {
    echo "Checking requirements..."
    command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting." >&2; exit 1; }
    command -v python3 >/dev/null 2>&1 || { echo "Python 3 is required but not installed. Aborting." >&2; exit 1; }
    command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Aborting." >&2; exit 1; }
    command -v mix >/dev/null 2>&1 || { echo "Elixir/Mix is required but not installed. Aborting." >&2; exit 1; }
}

# Create project structure
create_project_structure() {
    echo "Creating project structure..."
    
    # Create main project directory
    mkdir -p track-and-feel
    cd track-and-feel

    # Create service directories
    mkdir -p services/{core-api,game-server,audio-processor,media-streamer,frontend}
    mkdir -p config
    mkdir -p scripts
    mkdir -p docs
}

# Initialize Node.js Core API
setup_core_api() {
    echo "Setting up Core API service..."
    cd services/core-api

    # Initialize Node.js project
    npm init -y
    
    # Install dependencies
    npm install express typescript ts-node @types/node @types/express
    npm install pg redis jsonwebtoken cors dotenv
    
    # Initialize TypeScript
    npx tsc --init
    
    # Create basic structure
    mkdir -p src/{controllers,models,middleware,routes}
    
    # Create basic app file
    cat > src/app.ts << EOL
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

export default app;
EOL

    cd ../..
}

# Initialize Elixir Game Server
setup_game_server() {
    echo "Setting up Game Server service..."
    cd services/game-server
    
    # Install Phoenix project generator
    mix local.hex --force
    mix archive.install hex phx_new --force
    
    # Create new Phoenix project
    mix phx.new game_server --no-ecto
    
    # Add dependencies to mix.exs
    cat >> game_server/mix.exs << EOL
      defp deps do
        [
          {:phoenix, "~> 1.7"},
          {:redix, "~> 1.1"},
          {:jason, "~> 1.0"}
        ]
      end
EOL

    cd ../..
}

# Initialize Python Audio Processor
setup_audio_processor() {
    echo "Setting up Audio Processor service..."
    cd services/audio-processor
    
    # Create virtual environment
    python3 -m venv venv
    
    # Create requirements.txt
    cat > requirements.txt << EOL
fastapi==0.68.0
uvicorn==0.15.0
spleeter==2.3.0
celery==5.2.3
redis==4.3.4
python-dotenv==0.19.0
EOL

    # Create basic FastAPI app
    mkdir -p app
    cat > app/main.py << EOL
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
EOL

    cd ../..
}

# Initialize Media Streaming Service
setup_media_streamer() {
    echo "Setting up Media Streaming service..."
    cd services/media-streamer
    
    # Initialize Node.js project
    npm init -y
    
    # Install dependencies
    npm install express aws-sdk redis dotenv

    # Create basic structure
    mkdir -p src
    
    # Create basic app file
    cat > src/server.js << EOL
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

const port = process.env.PORT || 6000;
app.listen(port, () => {
    console.log(\`Media streamer listening on port \${port}\`);
});
EOL

    cd ../..
}

# Initialize React Frontend
setup_frontend() {
    echo "Setting up Frontend service..."
    cd services/frontend
    
    # Create Vite React app with TypeScript
    npm create vite@latest . -- --template react-ts
    
    # Install dependencies
    npm install
    
    # Install additional dependencies
    npm install @reduxjs/toolkit react-redux axios sockette
    
    # Setup Tailwind CSS
    npm install -D tailwindcss@3 postcss autoprefixer
    npx tailwindcss init -p
    
    # Configure Tailwind CSS
    cat > tailwind.config.js << EOL
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOL

    # Add Tailwind directives to CSS
    cat > src/index.css << EOL
@tailwind base;
@tailwind components;
@tailwind utilities;
EOL

    # Setup basic Vite config
    cat > vite.config.ts << EOL
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    proxy: {
      '/api': 'http://localhost:3000',
      '/ws': {
        target: 'ws://localhost:4000',
        ws: true,
      }
    }
  }
})
EOL

    cd ../..
}

# Create Docker configuration
setup_docker() {
    echo "Setting up Docker configuration..."
    
    # Create docker-compose.yml
    cat > docker-compose.yml << EOL
version: '3.8'

services:
  core-api:
    build: ./services/core-api
    ports: ["3000:3000"]
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/musicquiz
      - REDIS_URL=redis://redis:6379

  game-server:
    build: ./services/game-server
    ports: ["4000:4000"]
    environment:
      - REDIS_URL=redis://redis:6379

  audio-processor:
    build: ./services/audio-processor
    ports: ["5000:5000"]
    environment:
      - REDIS_URL=redis://redis:6379
      - S3_BUCKET=processed-tracks

  media-streamer:
    build: ./services/media-streamer
    ports: ["6000:6000"]
    environment:
      - S3_BUCKET=processed-tracks
      - REDIS_URL=redis://redis:6379

  frontend:
    build: ./services/frontend
    ports: ["8080:80"]

  postgres:
    image: postgres:13
    ports: ["5432:5432"]
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=musicquiz
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6
    ports: ["6379:6379"]
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
EOL

    # Create .env.example
    cat > .env.example << EOL
# Core API
CORE_API_PORT=3000
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost:5432/musicquiz
REDIS_URL=redis://localhost:6379

# Game Server
GAME_SERVER_PORT=4000

# Audio Processor
AUDIO_PROCESSOR_PORT=5000
S3_BUCKET=processed-tracks
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Media Streamer
MEDIA_STREAMER_PORT=6000

# Frontend
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:4000
EOL
}

# Create development scripts
setup_scripts() {
    echo "Setting up development scripts..."
    
    mkdir -p scripts
    
    # Create dev startup script
    cat > scripts/dev.sh << EOL
#!/bin/bash
docker-compose up -d postgres redis
cd services/core-api && npm run dev &
cd services/game-server && mix phx.server &
cd services/audio-processor && uvicorn app.main:app --reload &
cd services/media-streamer && npm run dev &
cd services/frontend && npm start
EOL
    
    chmod +x scripts/dev.sh
}

# Initialize git repository
setup_git() {
    echo "Initializing git repository..."
    
    git init
    
    # Create .gitignore
    cat > .gitignore << EOL
# Dependencies
node_modules/
venv/
__pycache__/
.elixir_ls/

# Environment
.env
.env.local

# Build outputs
dist/
build/
_build/

# IDE
.vscode/
.idea/

# Logs
*.log
logs/
EOL

    git add .
    git commit -m "Initial commit"
}

# Main setup process
main() {
    check_requirements
    create_project_structure
    setup_core_api
    setup_game_server
    setup_audio_processor
    setup_media_streamer
    setup_frontend
    setup_docker
    setup_scripts
    setup_git
    
    echo "✨ Project setup complete!"
    echo "To start development:"
    echo "1. Copy .env.example to .env and configure your environment variables"
    echo "2. Run 'docker-compose up' to start the infrastructure services"
    echo "3. Run './scripts/dev.sh' to start all services in development mode"
}

main