from repldex.discordbot import bot
from repldex.config import CONFIG
from . import Tester
import pytest
import asyncio
import os


# force it to use mock db
os.environ['dburl'] = ''


@pytest.fixture
def test():
	tester = Tester(bot.client)
	bot.client.http = tester.client.http
	bot.client._connection = tester.client._connection
	bot.client = tester.client
	return tester


@pytest.fixture
def event_loop():
	yield asyncio.new_event_loop()


@pytest.fixture
def client(test):
	return test.client


@pytest.fixture
def guild(test):
	return test.make_guild(id=662039537479843850)


@pytest.fixture
def channel(test, guild):
	return test.make_channel(guild, id=750045724166848572)


prefix = CONFIG.get('prefix', '^')


@pytest.mark.asyncio
async def test_entry(test, channel):
	await test.message(prefix + 'entry mat', channel)

	def check(message):
		if message['content']:
			return False
		if message['embed']['url'] != 'https://repldex.com/entry/mat':
			return False
		if message['embed']['title'] != 'mat':
			return False
		return True

	await test.verify_message(check)


@pytest.mark.asyncio
async def test_search(test, channel):
	await test.message(prefix + 'search mat', channel)

	def check(message):
		if message['content']:
			return False
		if not message['embed']['description'].startswith('1) mat\n'):
			return False
		if message['embed']['title'] != 'Results for mat':
			return False
		return True

	await test.verify_message(check)
