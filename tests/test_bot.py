from src.discordbot import discordbot as bot
from src.discordbot import commands  # noqa: F401 (must be imported in order for commands to work)
from src import database
import datetime
import pytest
import json
from . import Tester

with open('config/config.json', 'r') as f:
	config = json.loads(f.read())


async def search_entries(query, limit=10, search_id=True, page=0, discord_id=None, unlisted=False):
	return [{
		'_id': '4284eb47-912b-454d-9ac7-95667c5b0e71',
		'content': '<p>hello world</p>',
		'image': None,
		'markdown': 'hello world',
		'nohtml_content': 'hello world',
		'title': 'example',
		'history': [],
		'last_edited': datetime.datetime(2020, 7, 18, 3, 28, 7, 449000),
		'unlisted': False,
		'owner_id': 224588823898619905,
		'score': 53.651893615722656
	}]


database.search_entries = search_entries


@pytest.fixture
def test():
	tester = Tester(bot.client)
	bot.client.http = tester.client.http
	bot.client._connection = tester.client._connection
	bot.client = tester.client
	return tester


@pytest.fixture
def client(test):
	return test.client


@pytest.fixture
def guild(test):
	return test.make_guild(id=662039537479843850)


@pytest.fixture
def channel(test, guild):
	return test.make_channel(guild, id=750045724166848572)


prefix = config.get('prefix', '^')


@pytest.mark.asyncio
async def test_entry(test, channel):
	results = await database.search_entries('mat')
	print(results)
	await test.message(prefix + 'entry example', channel)

	def check(message):
		if message['content']:
			return False
		if message['embed']['description'] != 'hello world':
			return False
		if message['embed']['url'] != 'https://repldex.com/entry/example':
			return False
		if message['embed']['title'] != 'example':
			return False
		return True

	await test.verify_message(check)
