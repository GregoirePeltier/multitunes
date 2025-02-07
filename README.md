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
python >=3.8
node >= 16.0.0
npm >= 7.0.0
PostgreSQL >= 13
Redis >= 6
```

### Installation
=========== TODO ==============

## API Documentation
=========== TODO ==============

## Deployment
============ TODO ============

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Audio separation powered by Demucs
- External music data provided by deezer radio API
- Additional music metadata from MusicBrainz
