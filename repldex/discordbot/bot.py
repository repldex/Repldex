import discord
import base64
import os
intents = discord.Intents.default()
intents.members = True
client = discord.Client(intents=intents)

from repldex.config import BLACKLISTED_IDS, CONFIG
from repldex import utils


class BetterBot:
	def __init__(self, prefix, bot_id):
		self.prefixes = [prefix, f'<@{bot_id}>', f'<@!{bot_id}>']
		self.allowed = {}
		self.command_settings = {}
		self.functions = {}

	async def try_converter(self, ctx, string, converter):
		if hasattr(converter, 'convert'):
			return await converter.convert(converter, ctx, string)
		try:
			return converter(string)
		except ValueError:
			return

	async def parse_args(self, parsing_remaining, func, ctx):
		ann = func.__annotations__
		args = func.__code__.co_varnames[1:]  # [1:] to skip ctx
		return_args = []
		for argnum, arg in enumerate(args):
			if arg in ann:
				hint = ann[arg]
				found = None
				for i in reversed([pos for pos, char in enumerate(parsing_remaining + ' ') if char == ' ']):
					cmd_arg = parsing_remaining[:i]
					tried = await self.try_converter(ctx, cmd_arg, hint)
					if tried is not None:
						found = tried
						break
				if found:
					# fmt: off
					parsing_remaining = parsing_remaining[i + 1:]
					# fmt: off
					return_args.append(found)
				else:
					# raise NothingFound(f'nothing found {parsing_remaining} {hint}')
					parsing_remaining = (parsing_remaining + ' ').split(' ', len(args) - argnum)[-1]
					return_args.append(None)
			else:
				cmd_arg, parsing_remaining = (parsing_remaining + ' ').split(' ', 1)
				if cmd_arg:
					return_args.append(cmd_arg)
		return return_args

	async def process_commands(self, message):
		print('process_commands')
		parsing_remaining = message.content
		prefix_found = False
		prefix = ''
		for prefix in self.prefixes:
			if parsing_remaining.startswith(prefix):
				prefix_found = True
				break
		if not prefix_found:
			return
		parsing_remaining = parsing_remaining[len(prefix):].strip()
		command, parsing_remaining = (parsing_remaining + ' ').split(' ', 1)
		command = command.lower()
		if command in self.functions:
			if not self.allowed[command] and message.author.id in BLACKLISTED_IDS:
				return
			func = self.functions[command]
			bots_allowed = self.command_settings.get('allowed', False)
		else:
			print('command isnt in functions', self.functions)
			return
		if message.author.bot and not bots_allowed:
			return
		ctx = Context(message, client, prefix=prefix)
		if parsing_remaining:
			return_args = await self.parse_args(parsing_remaining, func, ctx)
		else:
			return_args = []
		# for annotation in func.__annotations__:
		# 	all_arguments[annotation] = func.__annotations__[annotation]
		print(func, return_args)
		return await func(ctx, *return_args)

	def command(self, name, aliases=[], allowed=False, bots_allowed=False):
		name = name.lower()

		print('command', name)

		def decorator(func):
			print('added new command', name)
			self.functions[name] = func
			self.allowed[name] = allowed
			if name not in self.command_settings:
				self.command_settings[name] = {}
			self.command_settings[name]['allowed'] = bots_allowed
			for alias in aliases:
				alias = alias.lower()
				self.functions[alias] = func
				self.allowed[alias] = allowed
				if alias not in self.command_settings:
					self.command_settings[alias] = {}
				self.command_settings[alias]['allowed'] = bots_allowed
			return func

		return decorator


class Context:  # very unfinished but its fine probably
	__slots__ = ('message', 'channel', 'guild', 'author', 'prefix', 'client')

	async def send(self, *args, embed=None, **kwargs):
		message = await self.message.channel.send(*args, **kwargs, embed=embed)
		if embed:
			try:
				await message.add_reaction(utils.x_emoji)
			except discord.errors.Forbidden:
				pass
			utils.commands_ran_by[message.id] = self.author.id
			for _ in range(10):
				await self.client.wait_for('message', check=lambda m: m.channel == message.channel)
			await message.delete()
		return message

	def __init__(self, message, client, prefix=None):
		self.message = message
		self.channel = message.channel
		self.guild = message.guild
		self.author = message.author

		self.prefix = prefix
		self.client = client


class NothingFound(BaseException):
	pass


bot_token = os.getenv('token')

if bot_token:
	# first part of the token is always the bot id
	bot_id = int(base64.b64decode(bot_token.split('.')[0]))
else:
	bot_id = 0  # might be set later by a unit test, so just default to 0


async def start_bot():
	if not bot_token:
		raise Exception('No token found')
	print('starting bot pog')
	await client.start(bot_token)


async def log_edit(editor, title, time):
	channel = client.get_channel(770468229410979881)
	await channel.send(f'{time}: <@{editor}>({editor}) edited {title}')


async def log_delete(title, time, content):
	channel = client.get_channel(770468181486600253)
	await channel.send(f'{title} has been deleted (through Repldex [direct database deletions are not detected]) at {time}')
	await channel.send(f'First 140 characters of entry: `{content[:140]}`')


async def log_view(title, time):
	channel = client.get_channel(770468271195553823)
	await channel.send(f'{title} has been viewed at {time}')


# duplicate?
# async def log_view(title, time, newurl):
# 	channel = client.get_channel(770498997428551680)
# 	await channel.send(title+" has been unlisted at "+time+" new url is "+newurl)

prefix = CONFIG.get('prefix', '^')


@client.event
async def on_ready():
	print('ready')
	await client.change_presence(activity=discord.Game(name=prefix + 'help'))


def discord_id_to_user(user_id):
	user = client.get_user(user_id)
	return str(user)


betterbot = BetterBot(prefix=prefix, bot_id=bot_id)


@client.event
async def on_message(message):
	await betterbot.process_commands(message)


@client.event
async def on_raw_reaction_add(payload):
	message_id = payload.message_id
	if message_id not in utils.commands_ran_by:
		return
	channel_id = payload.channel_id
	channel = client.get_channel(channel_id)
	message = await channel.fetch_message(message_id)

	author = utils.commands_ran_by[message.id]

	x_reactions = 0
	author_reacted = False
	for reaction in message.reactions:
		if reaction.emoji == utils.x_emoji:
			async for user in reaction.users():
				if user.id != client.user.id:
					x_reactions += 1
				if user.id == author:
					author_reacted = True
		if x_reactions >= 3 or author_reacted:
			try:
				await message.delete()
			except discord.errors.NotFound:
				pass

# this is required to make bot commands work, must be at the end otherwise it causes a circular import
from . import commands
