from repldex.config import DOT_ENV
from guppy import hpy
import threading
import time
from memory_profiler import memory_usage
mem_usage = memory_usage(-1, interval=.2, timeout=1)

h=hpy()
def printheap():
    while True:
     heap = h.heap()
     print(heap)
     print(heap[3].byid)
     print(heap[3].byid[0].shpaths)
     print(mem_usage)
     time.sleep(3)
#threading.Thread(target=printheap).start()
print('starting')

if DOT_ENV:
	from dotenv import load_dotenv

	load_dotenv()

# Don't move this up, env must be loaded first
from repldex.backend import api

from repldex.discordbot import bot as discordbot
from repldex.backend import website
website.start_server(discordbot.client.loop, discordbot.start_bot(), discordbot.client)
