# Multitunes

A dynamic web application that creates engaging music quizzes where players compete to identify songs from their separated instrumental tracks. 

_This project should heavily feature ai generated code_


## Features

### Core Functionality
- Real-time multiplayer support for competitive play
- Progressive track revelation system
- Score tracking and leaderboards
- Integration with music streaming services for playlist generation
- Automatic track separation

### Quiz Types
1. **Progressive Track Challenge**
   - Tracks are introduced one by one at specified intervals
   - Players score more points for early correct guesses
   - Bonus points for identifying specific instruments or track components

### User Features
- Personal statistics and progress tracking
- Custom playlist creation
- Social sharing capabilities

## Technical Architecture

### Frontend
- React.js with TypeScript
- Redux for state management
- WebSocket for real-time multiplayer functionality

### Backend
- Core-api in node.js 
- Audio processing service to handle audio transformations,in python
- GameServer, to handle realtime communication in elixir
- PostgreSQL database for user data and statistics
- Redis for caching and real-time features
- WebSocket server for multiplayer coordination

### External Services Integration
- Music Streaming API Integration
  - Playlist generation
  - 30-second preview extraction
  - Metadata retrieval

### Audio Processing Pipeline
1. **Track Download Service**
   - Handles music preview retrieval from streaming services
   - Manages download queue and rate limiting
   - Implements caching for frequently used tracks

2. **Audio Separation Service**
   - Uses machine learning models for track separation
   - Splits audio into components:
     - Vocals
     - Drums
     - Bass
	 - Guitar
	 - Piano
     - Other instruments
   - Processes and optimizes separated tracks for streaming

## Development Setup

### Prerequisites
```bash
node >= 16.0.0
npm >= 7.0.0
PostgreSQL >= 13
Redis >= 6
```

### Installation
1. Clone the repository
```bash
git clone https://github.com/your-org/music-quiz
cd music-quiz
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development servers
```bash
npm run dev
```

## API Documentation

### Authentication
All API endpoints except public routes require JWT authentication.

### Core Endpoints

#### Playlist Management
```
GET /api/playlists
POST /api/playlists/create
GET /api/playlists/:id
DELETE /api/playlists/:id
```

#### Quiz Management
```
GET /api/quizzes
POST /api/quizzes/create
GET /api/quizzes/:id
POST /api/quizzes/:id/submit
```

#### Audio Processing
```
POST /api/audio/process
GET /api/audio/:id/status
GET /api/audio/:id/stream/:track
```

## Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Manual Deployment
1. Build the application
```bash
npm run build
```

2. Start the server
```bash
npm run start
```

## Security Considerations

- Rate limiting on API endpoints
- Input validation for user submissions
- Secure audio file processing
- CORS configuration
- API key rotation for external services

## Performance Optimization

- Audio file caching
- CDN integration for static assets
- Database query optimization
- WebSocket connection pooling
- Lazy loading of audio tracks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Audio separation powered by Spleeter
- External music data provided by Spotify API
- Additional music metadata from MusicBrainz