from config import BASE_URL, EDITOR_IDS
from bs4 import BeautifulSoup as bs
from discord.ext import commands
from datetime import datetime
import timeago as timeagolib
import discordbot
import jellyfish
import database
import discord
import difflib
import html
import re

x_emoji = '❌'

auto_delete_channels = {
	437067256049172491  # oof-topic
}

commands_ran_by = {}


def embed_from_dict(dict, **kwargs):
	embed = discord.Embed(**kwargs)
	for i in dict:
		embed.add_field(name=i, value=dict[i], inline=False)
	return embed


def get_channel_members(channel_id):
	try:
		return discordbot.client.get_channel(channel_id).members
	except AttributeError:
		return [discordbot.client.get_channel(channel_id).recipient]


def check_user_id(ctx, arg):
	try:
		if ctx.guild:
			member = ctx.guild.get_member(int(arg))
		else:
			member = ctx.client.get_user(int(arg))
		if member is not None:
			return member
	except ValueError:
		pass


def check_mention(ctx, arg):
	match = re.match(r'<@!?(\d+)>', arg)
	if match:
		user_id = match.group(1)
		try:
			member = ctx.guild.get_member(int(user_id))
			if member is not None:
				return member
		except ValueError:
			pass


def check_name_with_discrim(ctx, arg):
	member = discord.utils.find(
		lambda m: str(m).lower() == arg.lower(),
		get_channel_members(ctx.channel.id)
	)
	return member


def check_name_without_discrim(ctx, arg):
	member = discord.utils.find(
		lambda m: m.name.lower == arg.lower(),
		get_channel_members(ctx.channel.id)
	)
	return member


def check_nickname(ctx, arg):
	member = discord.utils.find(
		lambda m: m.display_name.lower() == arg.lower(),
		get_channel_members(ctx.channel.id)
	)
	return member


def check_name_starts_with(ctx, arg):
	member = discord.utils.find(
		lambda m: m.name.lower().startswith(arg.lower()),
		get_channel_members(ctx.channel.id)
	)
	return member


def check_nickname_starts_with(ctx, arg):
	member = discord.utils.find(
		lambda m: m.display_name.lower().startswith(arg.lower()),
		get_channel_members(ctx.channel.id)
	)
	return member


def check_name_contains(ctx, arg):
	member = discord.utils.find(
		lambda m: arg.lower() in m.name.lower(),
		get_channel_members(ctx.channel.id)
	)
	return member


def check_nickname_contains(ctx, arg):
	member = discord.utils.find(
		lambda m: arg.lower() in m.display_name.lower(),
		get_channel_members(ctx.channel.id)
	)
	return member


class Member(commands.Converter):
	async def convert(self, ctx, arg):
		if arg[0] == '@':
			arg = arg[1:]

		# these comments suck but i dont really want to remove them
		# also this should be a module-level constant
		# but this module is too big already
		CHECKERS = [
			check_user_id,  # Check user id
			check_mention,  # Check mention
			check_name_with_discrim,  # Name + discrim
			check_nickname,  # Nickname
			check_name_starts_with,  # Name starts with
			check_nickname_starts_with,  # Nickname starts with
			check_name_contains,  # Name contains
			check_nickname_contains,  # Nickname contains
		]
		for checker in CHECKERS:
			member = checker(ctx, arg)
			if member is not None:
				return member

		return None


def remove_html(inputted, prev=None):
	inputted = str(inputted)
	new_string = re.sub(r'<(\s*)br(\s*)([\S\s]*)\/?>', '\n', inputted)
	new_string = re.sub(r'<\/(div|p|br|li|h1|h2|h3)>', ' ', inputted)
	new_string = re.sub(r'<[\S\s]{1,}?>', '', new_string)
	new_string = html.unescape(new_string)
	new_string = new_string.replace(' ', ' ')
	while '  ' in new_string:
		new_string = new_string.replace('  ', ' ')
	new_string = new_string.strip()

	if new_string == prev: return new_string
	else: return remove_html(new_string, prev=inputted)


def html_to_markdown(inputted, prev=None):
	print('html_to_markdown')
	new_string = str(inputted)
	if prev is None:
		new_string = new_string.replace('\n', ' ')
	new_string = re.sub(r'<(\s{0,}?)br(\s{0,}?)([\S\s]{0,}?)\/?>', '\n', inputted)
	new_string = re.sub(r'<(div|p|br)>', '', new_string)
	new_string = re.sub(r'<\/(div|p|br|h1|h2|h3)>', r'</\1>\n', new_string)
	new_string = re.sub(
		r'<(?:\s{0,}?)(b|strong|h1|h2|h3)(?:\s{0,}?)(?:[\S\s]*)>(.{1,}?)<\/?(?:\s*)\1(?:\s*)>',
		r'**\2**',
		new_string
	)
	new_string = re.sub(r'<(?:\s*)(i|em)(?:\s*)(?:[\S\s]*)>(.+?)<(?:\s*)\/\1>>', r'*\1*', new_string)
	new_string = re.sub(r'<li>(.+?)</li>', r'• \1\n', new_string)

	for found in list(re.finditer(r'<\s*a[\s\S]{1,}?href="(.{0,}?)"[\s\S]{0,}?>(.{0,}?)<\s*\/a\s*>', new_string))[::-1]:
		span_start, span_end = found.span()
		href, href_text = found.groups()
		href = href.replace(' ', '%20')
		if href[0] == '/':
			href = BASE_URL + href
		new_string = new_string[:span_start] + f'[{href_text}]({href})' + new_string[span_end:]

	# replace all the remaining tags with spaces
	new_string = re.sub(r'<[\S\s]{1,}?>', ' ', new_string)
	new_string = html.unescape(new_string)
	new_string = new_string.strip()
	if new_string == prev: return new_string
	else: return html_to_markdown(new_string, prev=inputted)


async def get_editor_list():
	editor_list = []
	for editor_id in EDITOR_IDS:
		editor_username = discordbot.discord_id_to_user(editor_id)
		personal_entry = await database.get_personal_entry(editor_id)
		if personal_entry:
			editor_html = f'<a href="/entry/{personal_entry}">{editor_username}</a>'
		else:
			editor_html = editor_username
		editor_html = f'<li>{editor_html}</li>'
		editor_list.append(editor_html)
	return '<ul>' + ('\n'.join(editor_list)) + '</ul>'


async def before_show_text(inputted):
	variables = {
		'editorcount': str(len(EDITOR_IDS)),
		'editorlist': get_editor_list,
	}
	new_string = inputted
	for found in list(re.finditer(r'{{\s{0,}?(.{1,}?)\s{0,}?}}', new_string))[::-1]:
		span_start, span_end = found.span()
		variable = found.group(1).lower()
		if variable in variables:
			variable_output = variables[variable]
			if hasattr(variable_output, '__code__'):
				variable_output = variable_output()
			if hasattr(variable_output, 'cr_code'):
				variable_output = await variable_output
			new_string = new_string[:span_start] + variable_output + new_string[span_end:]

	return new_string


def fix_html(inputted, prev=None):
	new_string = str(inputted)

	for found in list(re.finditer(r'<\s*a[\s\S]{1,}?href="(.{0,}?)"[\s\S]{0,}?>(.{0,}?)<\s*\/a\s*>', new_string))[::-1]:
		span_start, span_end = found.span()
		href, href_text = found.groups()
		href = href.replace(' ', '%20')
		if href.startswith(BASE_URL):
			href = href[len(BASE_URL):]
		elif href.startswith('https://repldex.mat1.repl.co'):
			href = href[len('https://repldex.mat1.repl.co'):]
		if href.startswith('/entry?name='):
			href = '/entry/' + href[len('/entry?name='):]
		elif href.startswith('/entry?id='):
			href = '/entry/' + href[len('/entry?id='):]
		link_html = f'<a href="{href}">{href_text}</a>'
		new_string = new_string[:span_start] + link_html + new_string[span_end:]

	new_string = new_string.strip()

	if new_string == prev: return new_string
	else: return fix_html(new_string, prev=inputted)


def prettify_html(inputted):
	soup = bs(inputted.strip(), 'html.parser')
	prettyHTML = soup.prettify()
	return prettyHTML


def compare_diff(a, b):
	diff = difflib.unified_diff(
		b.splitlines(),
		a.splitlines(),
		fromfile='before',
		tofile='after',
	)
	return '\n'.join(list(diff)[3:])


def timeago(date):
	return timeagolib.format(date, datetime.now())


def dictsort(d, reverse=True):
	s = sorted(d, key=lambda i: d.get(i), reverse=reverse)
	return s


def levenshtein(a, b):
	return jellyfish.levenshtein_distance(a, b)


def url_title(title):
	title = title.replace(' ', '+')
	title = title.replace('#', '')
	title = title.replace('?', '')
	title = title.replace('/', '+')
	return title


def datetime_to_int(t):
	return (t - datetime.datetime(1970, 1, 1)).total_seconds()


def get_top_editors(history, limit=5):
	revision_before = None
	content_before = None
	top_editors = {}
	# levenshtein
	for revision in history:
		author = revision['author']
		content = revision['content']
		if author not in top_editors:
			top_editors[author] = 0
		score = 0
		if revision_before is None:
			score += 2
		if content != content_before:
			score += 1
		if content_before and levenshtein(content, content_before) > 100:
			score += 3
		top_editors[author] += score
		revision_before = revision
		content_before = revision_before['content']
	return {editor: top_editors[editor] for editor in dictsort(top_editors)[:limit] if top_editors[editor]}


def html_image_with_thumbnail(data, is_preview=False, alt=''):
	url = data['src']
	thumbnail_b64 = data.get('thumbnail_b64')
	thumbnail_content_type = data.get('thumbnail-content-type', 'image/webp')
	el_class = 'previewImage' if is_preview else 'entryImage'
	output = f'<div class="imageContainer {el_class}">'
	output += f'<noscript><img src="{url}" alt="{alt}"></noscript>'
	thumbnail_src = f'data:{thumbnail_content_type};base64,{thumbnail_b64}'
	output += f'<img src="{thumbnail_src}" data-src="{url}" class="lazy" alt="{alt}">'
	output += '</div>'
	return output
