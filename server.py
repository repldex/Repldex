import asyncio
from datetime import datetime
import os
import json

import aiohttp
from aiohttp import web
from discordbot import discord_id_to_user
from jinja2 import Environment, FileSystemLoader, select_autoescape
import jinja2.ext

import commands
from config import EDITOR_IDS, ADMIN_IDS
import database
import images
import utils
from bs4 import BeautifulSoup

routes = web.RouteTableDef()

jinja_env = Environment(
	loader=FileSystemLoader(searchpath='templates'),
	autoescape=select_autoescape(['html', 'xml']),
	enable_async=True,
	extensions=[jinja2.ext.do],
	trim_blocks=True,
	lstrip_blocks=True
)

class JinjaNamespace:
	def __init__(self, **kwargs):
		self.args = kwargs

	def setitem(self, name, value):
		self.args[name] = value

	def getitem(self, name, default=None):
		return self.args.get(name, default)

	def appenditem(self, name, value):
		if not self.args.get(name):
			self.args[name] = [value]
		else:
			self.args[name].append(value)

	def __str__(self):
		return str(self.args)

	def __repr__(self):
		return str(self.args)

	def __len__(self):
		return len(self.args.keys())

	def keys(self):
		return list(self.args.keys())

	def __contains__(self, key):
		return key in self.args

jinja_env.filters['nohtml'] = utils.remove_html
jinja_env.filters['prettyhtml'] = utils.prettify_html
jinja_env.filters['diff'] = utils.compare_diff
jinja_env.filters['discordid'] = discord_id_to_user
jinja_env.filters['personalentry'] = database.get_personal_entry
jinja_env.filters['timeago'] = utils.timeago
jinja_env.filters['dictsort'] = utils.dictsort
jinja_env.filters['first'] = lambda l, f=1: l[:f]
jinja_env.filters['datetime_to_int'] = utils.datetime_to_int
jinja_env.filters['before_show_text'] = utils.before_show_text

jinja_env.globals['lazyimage'] = utils.html_image_with_thumbnail

jinja_env.globals['name_space'] = JinjaNamespace
jinja_env.globals['get_top_editors'] = utils.get_top_editors


async def load_template(filename, **kwargs):
	if not hasattr(load_template, 'template_dict'):
		load_template.template_dict = {}
	if filename in load_template.template_dict:
		t = load_template.template_dict[filename]
	else:
		t = jinja_env.get_template(filename)
		load_template.template_dict[filename] = t
	r = await t.render_async(**kwargs)
	return r

class Template:
	def __init__(self, name, **args):
		self.name = name
		self.args = args

@routes.get('/')
async def index(request):
	entries = await database.get_entries(sort='last_edited')
	entry_count = await database.count_entries()
	return Template(
		'index.html',
		entries=entries,
		entry_count=entry_count
	)


@routes.get('/edit')
async def edit_entry(request):
	entry_id = request.query.get('id')
	entry_data = await database.get_entry(entry_id)
	if entry_data:
		title = entry_data.get('title', None)
		content = entry_data.get('content', '')
		unlisted = entry_data.get('unlisted', False) == 'on'
		
	else:
		title = request.query.get('title')
		content = ''
		unlisted = False
	
	return Template(
		'edit.html',
		title=title,
		content=content,
		unlisted=unlisted,
	)

@routes.get('/entry')
async def redirect_view_entry(request):
	entry = request.query.get('id') or request.query.get('name')
	if not entry:
		raise web.HTTPNotFound()
	return web.HTTPFound('/entry/' + entry)


@routes.get('/history/{entry}')
async def view_entry_history(request):
	entry = request.match_info.get('entry')
	entry_data = await database.get_entry(name=entry)
	if entry_data:
		entry_id = entry_data['_id']
		title = entry_data.get('title', '[no title]')
		content = entry_data.get('content', '[no content]')
		history = reversed(entry_data.get('history', []))
	else:
		return web.HTTPNotFound()
	
	return Template(
		'history.html',
		title=title,
		content=content,
		id=entry_id,
		history=history,

		back_location='/entry/' + entry_id
	)

@routes.post('/edit')
async def edit_entry_post(request):
	if not request.is_editor:
		return web.HTTPFound('/')
	entry_id = request.query.get('id')
	post_data = await request.post()

	entry_id = request.query.get('id')
	entry_data = await database.get_entry(entry_id)
	title = post_data.get('title') or entry_data.get('title')
	image = post_data.get('image')
	content = post_data['content']
	if request.is_admin:
		unlisted = post_data.get('unlisted', 'off') == 'on'
	else:
		unlisted = None
	if image:
		image_url = await images.upload(image)
	else:
		image_url = None

	entry_id = await database.edit_entry(
		title=title,
		content=content,
		entry_id=entry_id,
		editor=request.discord_id,
		unlisted=unlisted,

		image=image_url
	)
	return web.HTTPFound('/entry?id=' + entry_id)



CLIENT_ID = 662036612460445713
CLIENT_SECRET = os.getenv('client_secret')
REDIRECT_URI = 'https://repldex.com/loggedin'

@routes.get('/login')
async def login_redirect(request):
	return web.HTTPFound(
		f'https://discordapp.com/oauth2/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code&scope=identify'
	)

@routes.get('/loggedin')
async def loggedin_redirect(request):
	code = request.query.get('code')
	if not code:
		return web.HTTPFound('/login')
	async with aiohttp.ClientSession() as s:
		r = await s.post(
			'https://discordapp.com/api/v6/oauth2/token',
			data={
				'client_id': CLIENT_ID,
				'client_secret': CLIENT_SECRET,
				'grant_type': 'authorization_code',
				'code': code,
				'redirect_uri': REDIRECT_URI,
				'scope': 'identify',
			}
		)
		data = await r.json()
		if 'error' in data:
			return web.HTTPFound('/login')
		access_token = data['access_token']
		r = await s.get(
			'https://discordapp.com/api/users/@me',
			headers={
				'Authorization': 'Bearer ' + access_token
			}
		)
		data = await r.json()
		user_id = int(data['id'])
		sid = await database.new_editor_session(user_id)
		resp = web.HTTPFound('/')
		resp.set_cookie(
			'sid',
			sid,
			max_age=31557600 # a year
		)
		return resp

@routes.get('/entry/{entry}')
async def view_entry(request):
	entry_name = utils.url_title(request.match_info.get('entry'))
	entry_data = await database.get_entry(name=entry_name)

	if entry_data:
		entry_id = entry_data['_id']
		title = entry_data['title']
		content = entry_data.get('content', '[no content]')
		unlisted = entry_data.get('unlisted', False)
		history = entry_data.get('history', [])
		image = entry_data.get('image')
	else:
		return web.HTTPNotFound()

	url_title = utils.url_title(title)

	if url_title != entry_name:
		return web.HTTPFound('/entry/' + url_title)
	
	return Template(
		'entry.html',
		title=title,
		content=content,
		id=entry_id,
		unlisted=unlisted,
		history=history,
		image=image,

		back_location='/'
	)

@routes.get('/random')
async def random_entry(request):
	entry = await database.get_random_entry()
	
	return web.HTTPFound('/entry/' +entry['_id'])

@routes.get('/api/website-title')
async def api_website_title(request):
	url = request.query['url']

	print(url)
	if url.startswith('//'):
		url = 'https:' + url
	elif url[0] == '/':
		url = 'https://repldex.com' + url

	if url.startswith('https://repldex.com'):
		url = url[len('https://repldex.com'):]
		if url.startswith('/entry/'):
			entry_name = url[len('/entry/'):]
			entry = await database.get_entry(name=entry_name)
			return web.json_response({
				'title': entry['title'],
				'favicon': 'https://repldex.com/static/icon.png',
				'content': entry['nohtml_content']
			})
		else:
			return web.json_response({})


	async with aiohttp.ClientSession() as s:
		async with s.get(url) as r:
			soup = BeautifulSoup(await r.text(), 'html.parser')
			title = soup.title.string
			favicon_link = soup.find('link', rel='icon')
	if favicon_link:
		favicon = favicon_link['href']
		if favicon.startswith('//'):
			favicon = 'https:' + favicon
		if favicon[0] == '/':
			base_url = url[:url.find('/', 9)]
			favicon = base_url + favicon
	else:
		favicon = None
	return web.json_response({
		'title': title,
		'favicon': favicon
	})

	# return web.HTTPFound('/entry/' +entry['_id'])


@web.middleware
async def middleware(request, handler):
	if request.url.host == 'repldex--mat1.repl.co':
		return web.HTTPFound('https://ReplDex.mat1.repl.co' + request.url.path)
	
	sid_cookie = request.cookies.get('sid')
	if sid_cookie:
		discord_id = await database.get_editor_session(sid_cookie)
	else:
		discord_id = None
	is_editor = discord_id in EDITOR_IDS
	is_admin = discord_id in ADMIN_IDS
	request.is_editor = is_editor
	request.is_admin = is_admin
	request.discord_id = discord_id
	resp = await handler(request)
	if isinstance(resp, Template):
		args = resp.args
		sid_cookie = request.cookies.get('sid')
		args['discord_id'] = discord_id
		args['is_editor'] = is_editor
		args['is_admin'] = is_admin
		resp = web.Response(
			text=await load_template(
				resp.name,
				**args
			),
			content_type='text/html'
		)
	return resp

def start_server(loop, background_task, client):
	#app.discord = client
	global app
	asyncio.set_event_loop(loop)
	app = web.Application(
		middlewares=[middleware],
		client_max_size=4096**2
	)
	app.discord = client
	app.add_routes([web.static('/static', 'static')])
	app.add_routes(routes)
	asyncio.ensure_future(
		background_task,
		loop=loop
	)
	web.run_app(
		app,
		port=8081
	)
