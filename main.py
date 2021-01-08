from repldex.config import DOT_ENV
print('starting')

if DOT_ENV:
	from dotenv import load_dotenv

	load_dotenv()

# Don't move this up, env must be loaded first
from repldex.backend import api

from repldex.discordbot import bot as discordbot
from repldex.backend import website

website.start_server(discordbot.client.loop, discordbot.start_bot(), discordbot.client)
