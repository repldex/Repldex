import json

print('starting')

with open('config/config.json', 'r') as f:
	config = json.load(f)

if config.get('dotenv', False):
	__import__('dotenv').load_dotenv()

import api
import server
import discordbot

server.start_server(discordbot.client.loop, discordbot.start_bot(),
                    discordbot.client)
