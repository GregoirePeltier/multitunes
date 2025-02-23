# Multitunes

A dynamic web application that creates engaging music quizzes where players compete to identify songs from their separated instrumental tracks. 

_This project should heavily feature ai generated code_


## Features

### Core Functionality
 - Progressive track revelation system
- Automatic track separation

### Quiz Types
1. **Progressive Track Challenge**
   - Tracks are introduced one by one at specified intervals
   - Players score more points for early correct guesses

### User Features
_Nothing yet here_
- Personal statistics and progress tracking
- Custom playlist creation
- Social sharing capabilities

## Architecture

- Frontend: React
   Displays the daily quizzes, talk to the Backend
- Backend: Nodejs
   Supply the quizes and their history from the Database
   Triggers the regular new quiz generation and song ingestion
- Ingestion worker: Python( Deployed on cloud run )
   Is regularly triggered to ingest new and unknown songs
   Downloads, splits, overlay and upload a song
   Needs a GPU so run on gcp Cloud Run for cheap access to one
- Database: Postgres
- External data: Deezer
   We querry Deezer for musical data and extracts

## Development Setups

### Prerequisites
```bash
python >=3.8
node >= 20.0.0
PostgreSQL >= 13
docker
```

### Installation

*Frontend*
```bash
pushd services/frontend
npm install
```
*Backend*
```bash
pushd services/core-api
npm install 
```
*IngestionWorker*
```bash
pushd services/audio-processor
python -m venv ./venv
source venv/bin/activate
pip install -r requirements.txt
```
*Development database*
```bash
docker compose -f docker-compose.dev.yml pull db
```
### Local Running

#### General prerequisite
- Prepare your .env file

   You can copy dev.env for development, **obviously it need to be replaced for actual deployment**

- Run your local db
```bash
docker compose -f docker-compose.dev.yaml --env-file dev.env up db -d
```
#### Launch your Backend
```bash
pushd services/core-api
npm run dev --env-file=../../dev.env
```
#### Launch your Frontend
```bash
pushd services/frontend
npm run dev
```
#### Run the audio api
=========== TODO ==============



## API Documentation
=========== TODO ==============

## Deployment
### Frontend
We deploy on firebase
```bash
pushd services/frontend
firebase deploy # AFTER following the firebase initialization instructions
```
For general purpose deployment:
```bash
pushd services/frontend
npm run build
```
And you will need to serve the dist content, configured as a single page app
### Backend and Database

We deploy naively, as we don't have a container registry setup
```bash
git clone https://github.com/GregoirePeltier/multitunes.git
pushd multitunes
```
Setup your .env file, you can copy the dev.env and adapt it

``` bash
docker compose --env-file .env up
```
Lauches the server and it's database

We use a nginx reverse proxy, setup to connect to the container's network

### Ingestion Worker
==== TODO====

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Audio separation powered by Demucs
- External music data provided by deezer charts API
- Additional music metadata from MusicBrainz


## TODO
_this is a dev note of things that are still to be done_
## Technical
_misc of technical remiders_
- Update tests after rushed change to a daily test app
- Deploy on gcp
## Critical
_This is breaking the app_
## Needed
_This is needed to consider the app done_
- Have a automated quizz generation system


## Nice to have
_Things that would be nice to have, but not required_
- Quizzes by artists