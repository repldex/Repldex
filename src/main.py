from config import DOT_ENV

print('starting')

if DOT_ENV == False:
	from dotenv import load_dotenv

	load_dotenv()

# Don't move this up, env must be loaded first
import discordbot
import server

server.start_server(discordbot.client.loop, discordbot.start_bot(), discordbot.client)
