import api
import server
import discordbot

this is invalid syntax

print('starting')

server.start_server(
	discordbot.client.loop,
	discordbot.start_bot(),
	discordbot.client
)
