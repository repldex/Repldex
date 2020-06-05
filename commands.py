import discord
from discordbot import betterbot, client
from discord.ext import commands
import random

from config import EDITOR_IDS, BASE_URL, ADMIN_IDS
import database
import utils

# ACTUAL COMMANDS START HERE

@betterbot.command(name='help')
async def help(message, *args):
	commands = {
		'search <query>': 'Finds entries that match the query',
		'entry <name>': 'Shows the matching entry',
		'random': 'Gets a random entry'
	}
	if message.author.id in EDITOR_IDS:
		commands['selfentry <name>'] = 'Links you to your entry (editor only)'
		commands['newentry <name>'] = 'Sends link to write new entry (editor only)'
        if message.author.id in ADMIN_IDS:
		commands['link <user mention> <article>'] = 'Manually link non-editors to entries (admin only)'
	content = []
	prefix = message.prefix
	for command in commands:
		content.append(
			f'{prefix}**{command}** - {commands[command]}'
		)

	embed = discord.Embed(
		title='Commands',
		description='\n'.join(content)
	)
	await message.send(embed=embed)

async def create_entry_embed(entry_data, author_id=None):
	html = entry_data['content']
	# html = await utils.before_show_text(html)
	content = utils.html_to_markdown(html)
	content_ending = ''
	# if author_id in EDITOR_IDS:
	# 	entry_id = entry_data['_id']
	# 	content_ending = f'\n\n*[Click here to edit]({BASE_URL}/edit?id={entry_id})*'

	if len(content) > 2048:
		content = content[:2045 - len(content_ending)] + '...'
	content += content_ending
	title = utils.url_title(entry_data['title'])
	view_url = f'{BASE_URL}/entry/{title}'
	view_url = view_url
	embed = discord.Embed(
		title=entry_data['title'],
		description=content,
		url=view_url
	)
	if entry_data.get('image'):
		embed.set_thumbnail(url=entry_data['image']['src'])

	return embed

@betterbot.command(name='search')
async def search_entries(message, *args):
	numbers = (
		'1️⃣',
		'2️⃣',
		'3️⃣',
		'4️⃣',
		'5️⃣',
		'6️⃣',
		'7️⃣',
		'8️⃣',
		'9️⃣',
		'🔟'
	)
	search_query = ' '.join(args)
	found = await database.search_entries(search_query)
	if found:
		content = []
		for i, result in enumerate(found, 1):
			title = result['title']
			content.append(f'{i}) {title}')
		content = '\n'.join(content)
	else:
		content = 'No results'
	embed = discord.Embed(
		title=f'Results for {search_query}',
		description=content
	)
	# if found:
	# 	embed.set_footer(text=f'React with {one_emoji} to get the first result')
	msg = await message.send(embed=embed)
	if found:
		for emoji in numbers[:len(found)]:
			await msg.add_reaction(emoji)
		def check(reaction, user):
			message_matches = reaction.message.id == msg.id
			user_matches = user == message.author
			emoji_matches = str(reaction.emoji) in numbers
			return message_matches and user_matches and emoji_matches
		reaction, _ = await client.wait_for('reaction_add', check=check)
		emoji = str(reaction.emoji)
		emoji_pos = numbers.index(emoji)
		embed = await create_entry_embed(found[emoji_pos], author_id=message.author.id)
		await message.send(embed=embed)

@betterbot.command(name='entry')
async def show_entry(message, *args):
	search_query = ' '.join(args)
	found = await database.search_entries(search_query, limit=1)
	if found:
		embed = await create_entry_embed(found[0], author_id=message.author.id)
		await message.send(embed=embed)
	else:
		embed = discord.Embed(
			title="This entry doesn't exist"
		)
		search_query_url_encoded = utils.url_title(search_query)
		edit_url = f'{BASE_URL}/edit?title={search_query_url_encoded}'
		edit_url = edit_url
		if message.author.id in EDITOR_IDS:
			embed.description = f'[Click here to write it!]({edit_url})'
		await message.send(embed=embed)

@betterbot.command(name='selfentry')
async def personal_entry(message, *args):
	if message.author.id not in EDITOR_IDS: return
	search_query = ' '.join(args)
	if not search_query:
		entry_id = await database.get_personal_entry(message.author.id)
		if not entry_id:
			return await message.send("You haven't set a personal entry yet")
		entry = await database.get_entry(entry_id)
		
		embed = await create_entry_embed(entry, author_id=message.author.id)
		return await message.send(embed=embed)
	found = await database.search_entries(search_query, limit=1)
	if found:
		entry = found[0]
		title = entry['title']
		entry_id = entry['_id']
		await database.set_personal_entry(message.author.id, entry_id)
		await message.send(f'Set your personal entry to `{title}`')
	else:
		await message.send('Invalid entry')
		
@betterbot.command(name='link')
async def personal_entry(message, member: discord.Member,*args):
	if message.author.id not in ADMIN_IDS: return
	try:
		#if errored, should ignore. (Admin can manually link mentioned user and entry)
		user_id = message.mentions[0].id
		args = " ".join(args)
		search_query = args.split(user_id+">")[1]
		found = await database.search_entries(search_query, limit=1)
	        if found:
		  entry = found[0]
		  title = entry['title']
		  entry_id = entry['_id']
		  await database.set_personal_entry(user_id, entry_id)
		  await message.send(f'Set `{@}` personal entry to `{title}`')
	        else:
		  await message.send('Invalid entry')
	except:
		await message.send("Wrong syntax, or something.")
		
@betterbot.command(name='newentry')
async def new_entry(message, *args):
	search_query = ' '.join(args)
	search_query_url_encoded = utils.url_title(search_query)
	edit_url = f'{BASE_URL}/edit?title={search_query_url_encoded}'
	edit_url = edit_url
	if message.author.id in EDITOR_IDS:
			embed = discord.Embed(
			title="Write "+search_query,
			description=f'[Click here to write it!]({edit_url})'
			)
			found = await database.search_entries(search_query, limit=1)
			if found:
				embed.set_footer('Alert: There may be an entry with the same/similar name or topic.') 
	else:
			embed = discord.Embed(
			title="This command is editor only"
			)
	await message.send(embed=embed)
		
@betterbot.command(name='random')
async def random_entry(message, *args):
	entry = await database.get_random_entry()

	embed = await create_entry_embed(entry, author_id=message.author.id)
	await message.send(embed=embed)
