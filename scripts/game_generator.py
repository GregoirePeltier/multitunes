import requests
from collections import defaultdict
from pathlib import Path
import json
import random
"""
{"id": 100063584, "readable": true, "title": "I Cry All Day",
"title_short": "I Cry All Day", "title_version": "", "isrc": "FRZ111500045",
"link": "https://www.deezer.com/track/100063584",
"share": "https://www.deezer.com/track/100063584?utm_source=deezer&utm_content=track-100063584&utm_term=0_1739190894&utm_medium=web",
"duration": 208, "track_position": 1, "disk_number": 1,
"rank": 407738, "release_date": "2015-09-18", "explicit_lyrics": false, 
"explicit_content_lyrics": 6, "explicit_content_cover": 2, 
"preview": "https://cdnt-preview.dzcdn.net/api/1/1/6/8/7/0/6871efddd622755984eae46756dadcd5.mp3?hdnea=exp=1739191794~acl=/api/1/1/6/8/7/0/6871efddd622755984eae46756dadcd5.mp3*~data=user_id=0,application_id=42~hmac=90fa7cbc1266945c8e46acd6772798a6ec4ae741f6c0b5495e2b8d4ed8ec91f6",
"bpm": 114.8, "gain": -7.8, "available_countries": ["BE", "CH", "FR"], 
"contributors": [{"id": 1044914, "name": "Hyphen Hyphen", "link": "https://www.deezer.com/artist/1044914", "share": "https://www.deezer.com/artist/1044914?utm_source=deezer&utm_content=artist-1044914&utm_term=0_1739190894&utm_medium=web", "picture": "https://api.deezer.com/artist/1044914/image", "picture_small": "https://cdn-images.dzcdn.net/images/artist/2aef72adae501ffccf0e73ca103f1cf4/56x56-000000-80-0-0.jpg", "picture_medium": "https://cdn-images.dzcdn.net/images/artist/2aef72adae501ffccf0e73ca103f1cf4/250x250-000000-80-0-0.jpg", "picture_big": "https://cdn-images.dzcdn.net/images/artist/2aef72adae501ffccf0e73ca103f1cf4/500x500-000000-80-0-0.jpg", "picture_xl": "https://cdn-images.dzcdn.net/images/artist/2aef72adae501ffccf0e73ca103f1cf4/1000x1000-000000-80-0-0.jpg", "radio": true, "tracklist": "https://api.deezer.com/artist/1044914/top?limit=50", "type": "artist", "role": "Main"}], 
"md5_image": "af05212bce1484949762365c30d33401", 
"track_token": "AAAAAWep8m5nqwuuYKPTIRkXEteUOb-7xjOErTVbuJqbKf9mG6xy1BIKwyAxPVOmEmW6ZOLNRcsKn7VRvgxXVR6jYUxYJkL8XUVjqyD5nr-ZMX2qI2ngohpZOTQcTcSruHscLY4d0nAUqHJXGVOrx-g1Z2HRLJqXxPG5Hi-5-TizETIAaNIhIw3axPtuC7IQPYwHJBrvwUimPHZP3FFv_YeuschHrKS1CwFR_rQ3eSMjhFMsMZQdMbZpOkde1urtP3xlUY_GFPBxKlYNJUzHjO1CNXA54IfUnK1JH_q6E_tfaunfkqlId4ZrG-Hf-EoPiwNaIK5L6Z8FX-pEROe5WMnUy1q0ysyHoyIkz9i1PRCiYmF9xjkSGlFHGuh3QBAwPltslfNbRs7gDtsSZsYbiOmmFXqtxiu2FMqzzasGg0eqmY8TaZYevB5J9Pi7lt8Q", 
"artist": {"id": 1044914, "name": "Hyphen Hyphen", "link": "https://www.deezer.com/artist/1044914", "share": "https://www.deezer.com/artist/1044914?utm_source=deezer&utm_content=artist-1044914&utm_term=0_1739190894&utm_medium=web", "picture": "https://api.deezer.com/artist/1044914/image", "picture_small": "https://cdn-images.dzcdn.net/images/artist/2aef72adae501ffccf0e73ca103f1cf4/56x56-000000-80-0-0.jpg", "picture_medium": "https://cdn-images.dzcdn.net/images/artist/2aef72adae501ffccf0e73ca103f1cf4/250x250-000000-80-0-0.jpg", "picture_big": "https://cdn-images.dzcdn.net/images/artist/2aef72adae501ffccf0e73ca103f1cf4/500x500-000000-80-0-0.jpg", "picture_xl": "https://cdn-images.dzcdn.net/images/artist/2aef72adae501ffccf0e73ca103f1cf4/1000x1000-000000-80-0-0.jpg", "radio": true, "tracklist": "https://api.deezer.com/artist/1044914/top?limit=50", "type": "artist"},
"album": {"id": 10245370, "title": "Times", "link": "https://www.deezer.com/album/10245370", "cover": "https://api.deezer.com/album/10245370/image", "cover_small": "https://cdn-images.dzcdn.net/images/cover/af05212bce1484949762365c30d33401/56x56-000000-80-0-0.jpg", "cover_medium": "https://cdn-images.dzcdn.net/images/cover/af05212bce1484949762365c30d33401/250x250-000000-80-0-0.jpg", "cover_big": "https://cdn-images.dzcdn.net/images/cover/af05212bce1484949762365c30d33401/500x500-000000-80-0-0.jpg", "cover_xl": "https://cdn-images.dzcdn.net/images/cover/af05212bce1484949762365c30d33401/1000x1000-000000-80-0-0.jpg", "md5_image": "af05212bce1484949762365c30d33401", "release_date": "2015-09-18", "tracklist": "https://api.deezer.com/album/10245370/tracks", "type": "album"}, 
"type": "track"}
"""
ALL = 0
POP = 132
RAP = 116
ROCK = 152
RNB = 165
METAL = 464
FOLK = 466
COUNTRY = 84
FRENCH = 52
SOUL = 169
BLUES = 153

GENRES = [ALL, POP, RAP, ROCK, RNB, METAL, FOLK, COUNTRY, FRENCH, SOUL, BLUES]
"""A utility class to get deezer_api urls"""


class DEEZER_URLS:
    def root_url(self):
        return f"https://api.deezer.com/"
    def genre_charts(self, genre_id):
        return f"{self.root_url()}/chart/{genre_id}/tracks?limit=300"

CHART_CACHE = dict()
def get_genre_charts(genre_id):
    if genre_id not in CHART_CACHE:
        CHART_CACHE[genre_id] =  requests.get(DEEZER_URLS().genre_charts(genre_id)).json()["data"]
    return CHART_CACHE[genre_id]


def create_games(tracks):
    question_tracks = list(tracks)
    random.shuffle(question_tracks)
    forbidden_answers=[None]*5*5
    games = []
    for i in range(0,len(question_tracks),5):
        questions = []
        same_game_id = {t["id"] for t in question_tracks[i:i+6]}
        for q in range(i,i+5):
            track = question_tracks[q]
            answers = [{"id": track["id"], "title": track["title"]}]
            forbidden_answers[q%len(forbidden_answers)]=track["id"]
            while len(answers)<5:
                pick = random.choice(tracks)
                while (pick["id"] in forbidden_answers or pick["id"] in same_game_id):
                    pick = random.choice(tracks)
                answers.append({"id": pick["id"], "title": pick["title"]})
                forbidden_answers[(q+len(answers)-1)%len(forbidden_answers)] = pick["id"]
            random.shuffle(answers)
            questions.append({
                "track": track["id"],
            "answers":answers
            })
        games.append({"questions":questions})
    return games
def create_game(tracks,genre=None):
    if genre is None:
        genre = ALL
    random.shuffle(tracks)
    questions = []
    for i in range(5):
        question_track = tracks.pop()
        answers = [
            {"id": question_track["id"], "title": question_track["title"]}
        ]
        for i in range(4):
            track = tracks.pop()
            answers.append(
                {"id": track["id"], "title": track["title"]}
            )
        random.shuffle(answers)
        questions.append({
            "track": {
                "id": question_track["id"],
                "title": question_track["title"],
                "artist": question_track["artist"]["name"],
                "cover": question_track["album"]["cover_medium"],
            },
            "answers":answers
        })
    return {"questions":questions}
tracks_by_genre = defaultdict(lambda:list())
with open("./tracks.jsonl","w") as tracks:
    for genre in GENRES:
        gt=get_genre_charts(genre)
        for t in gt:
            tracks.write(json.dumps(t))
            tracks.write("\n")
            tracks.flush()
        tracks_by_genre[genre].extend(gt)

genre_games = dict()
for genre in GENRES:
    games = list()
    tracks = list(get_genre_charts(genre))
    genre_games[genre]=create_games(tracks)
with open("./games.json","w") as game_file:
    json.dump(genre_games,game_file,indent=4)

