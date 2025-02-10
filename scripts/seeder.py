from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import json
import os
from dotenv import load_dotenv
from datetime import datetime,timedelta
def get_db_url():
    load_dotenv(os.getenv("ENV_FILE",".env"))
    
    user = os.getenv('DB_USERNAME')
    password = os.getenv('DB_PASSWORD')
    host = os.getenv('DB_HOST', 'localhost')
    port = os.getenv('DB_PORT', '5432')
    db = os.getenv('DB_DATABASE', 'public')
    
    return f'postgresql://{user}:{password}@{host}:{port}/{db}'

def populate_tracks(json_file_path):
    engine = create_engine(get_db_url())
    Session = sessionmaker(bind=engine)
    session = Session()
    
    with open(json_file_path, 'r') as file:
        tracks = [json.loads(track) for track in file]
        
        if not isinstance(tracks, list):
            tracks = [tracks]
            
        try:
            for track in tracks:
                query = text("""
                    INSERT INTO track (id, title, artist, cover)
                    VALUES (:id, :title, :artist, :cover)
                    ON CONFLICT (id) DO UPDATE 
                    SET title = :title, 
                        artist = :artist, 
                        cover = :cover
                """)
                
                session.execute(query, {
                    'id': track['id'],
                    'title': track['title'],
                    'artist': track['artist']["name"],
                    'cover': track['album']["cover_medium"]
                })
            
            session.commit()
            print(f"Successfully inserted {len(tracks)} tracks")
            
        except Exception as e:
            session.rollback()
            print(f"Error inserting tracks: {str(e)}")
            raise
        finally:
            session.close()

def populate_games(json_file_path, start_date_str):
    engine = create_engine(get_db_url())
    Session = sessionmaker(bind=engine)
    session = Session()
    
    start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
    
    with open(json_file_path, 'r') as file:
        games_by_genre = json.load(file)
        
    try:
        for genre_id, games in games_by_genre.items():
            current_date = start_date

            for game_data in games:
                # Insert game
                game_query = text("""
                    INSERT INTO game (date, genre)
                    VALUES (:date, :genre)
                    RETURNING id
                """)
                result = session.execute(game_query, {
                    'date': current_date.isoformat(),
                    'genre': genre_id
                })
                game_id = result.fetchone()[0]
                # Insert questions and answers
                for question_data in game_data['questions']:
                    question_query = text("""
                        INSERT INTO question ("trackId", "gameId")
                        VALUES (:trackId, :gameId)
                        RETURNING id
                    """)
                    result = session.execute(question_query, {
                        'trackId': question_data['track'],
                        'gameId': game_id
                    })
                    question_id = result.fetchone()[0]
                    
                    # Insert answers
                    for answer_data in question_data['answers']:
                        answer_query = text("""
                            INSERT INTO answer (id, title, "questionId")
                            VALUES (:id, :title, :question_id)
                        """)
                        session.execute(answer_query, {
                            'id': answer_data['id'],
                            'title': answer_data['title'],
                            'question_id': question_id
                        })
                
                session.commit()
                print(f"Inserted game for genre {genre_id} on {current_date}")
                current_date += timedelta(days=1)
                
            
    except Exception as e:
        session.rollback()
        print(f"Error inserting games: {str(e)}")
        raise
    finally:
        session.close()
if __name__ == "__main__":
    import sys
    print("This seeder is meant to initialize the database from generated json files")
    print("This is to bootstrap the db when we first deploy")
    if len(sys.argv) != 4 and len(sys.argv!=3):
        print("Usage: python populate_db.py [--tracks | --games] <path_to_json_file> [date_for_games YYYY-MM-DD]")
        sys.exit(1)
    if sys.argv[1]=="--tracks":
        populate_tracks(sys.argv[2])
    else:
        populate_games(sys.argv[2],sys.argv[3])