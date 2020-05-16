import discordbot
import asyncio
import utils

# this is just so i can customize command parsing more


class Context():  # very unfinished but its fine probably
	__slots__ = ('message', 'channel', 'guild', 'author', 'prefix')

	async def send(self, *args, embed=None, **kwargs):
		message = await self.message.channel.send(*args, **kwargs, embed=embed)
		if embed:
			await message.add_reaction(utils.x_emoji)
			utils.commands_ran_by[message.id] = self.author.id
			# print(dir(message.guild))
			for _ in range(10):
				print('waiting for message')
				await discordbot.client.wait_for('message', check=lambda m:m.channel == message.channel)
			await message.delete()
		return message

	def __init__(self, message, prefix=None):
		self.message = message
		self.channel = message.channel
		self.guild = message.guild
		self.author = message.author

		self.prefix = prefix


class NothingFound(BaseException): pass


class BetterBot():
	functions = {}

	def __init__(self, prefix, bot_id):
		self.prefixes = [
			prefix,
			f'<@{bot_id}>',
			f'<@!{bot_id}>'
		]

	async def try_converter(self, ctx, string, converter):
		if hasattr(converter, 'convert'):
			return await converter.convert(converter, ctx, string)
		try:
			return converter(string)
		except ValueError:
			return

	async def parse_args(self, parsing_left, func, ctx):
		ann = func.__annotations__
		args = func.__code__.co_varnames[1:]  # [1:] to skip ctx
		return_args = []
		for argnum, arg in enumerate(args):
			if arg in ann:
				hint = ann[arg]
				found = None
				for i in reversed([pos for pos, char in enumerate(parsing_left + ' ') if char == ' ']):
					cmd_arg = parsing_left[:i]
					tried = await self.try_converter(ctx, cmd_arg, hint)
					if tried is not None:
						found = tried
						break
				if found:
					parsing_left = parsing_left[i + 1:]
					return_args.append(found)
				else:
					# raise NothingFound(f'nothing found {parsing_left} {hint}')
					parsing_left = (parsing_left + ' ').split(' ', len(args) - argnum)[-1]
					return_args.append(None)
			else:
				cmd_arg, parsing_left = (parsing_left + ' ').split(' ', 1)
				if cmd_arg:
					return_args.append(cmd_arg)
		return return_args

	async def process_commands(self, message):
		if message.author.bot:
			return
		parsing_left = message.content
		found = False
		for prefix in self.prefixes:
			if parsing_left.startswith(prefix):
				found = True
				break
		if not found: return
		parsing_left = parsing_left[len(prefix):].strip()
		command, parsing_left = (parsing_left + ' ').split(' ', 1)
		command = command.lower()
		if command in self.functions:
			func = self.functions[command]
		else:
			return
		ctx = Context(message, prefix=prefix)
		if parsing_left:
			return_args = await self.parse_args(parsing_left, func, ctx)
		else:
			return_args = []
		# for annotation in func.__annotations__:
		# 	all_arguments[annotation] = func.__annotations__[annotation]
		return await func(ctx, *return_args)

	def command(self, name, aliases=[]):
		def decorator(func):
			self.functions[name.lower()] = func
			for alias in aliases:
				self.functions[alias.lower()] = func
			return func
		return decorator
