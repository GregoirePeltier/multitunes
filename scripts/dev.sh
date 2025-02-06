#!/bin/bash
docker-compose up -d postgres redis
cd services/core-api && npm run dev &
cd services/game-server && mix phx.server &
cd services/audio-processor && uvicorn app.main:app --reload &
cd services/media-streamer && npm run dev &
cd services/frontend && npm start
