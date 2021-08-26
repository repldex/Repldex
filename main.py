import os
print('starting')

if os.path.exists(os.path.join(os.getcwd(), '.env')): # load .env if exists
	from dotenv import load_dotenv
	load_dotenv()

# Don't move this up, env must be loaded first
from repldex.backend import api

from repldex.discordbot import bot as discordbot
from repldex.backend import website

website.start_server(discordbot.client.loop, discordbot.start_bot(), discordbot.client)
