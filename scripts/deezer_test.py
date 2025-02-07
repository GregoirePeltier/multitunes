import requests
import random
radios = requests.get("https://api.deezer.com/radio").json()["data"][:10]
for radio in radios:
	print(radio["title"])
radio = radios[random.randint(0,10)]
print("Picked",radio["title"])
print(radio)
tracks = requests.get(radio["tracklist"]).json()["data"]
print(tracks[0])
for t in tracks:
	print(t["title"],t["preview"])
