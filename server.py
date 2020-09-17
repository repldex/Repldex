import asyncio
from datetime import datetime
import os
import json
from ibm_watson import LanguageTranslatorV3
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
import aiohttp
from aiohttp import web
from discordbot import discord_id_to_user
from jinja2 import Environment, FileSystemLoader, select_autoescape
import jinja2.ext
import functools

import commands
from config import EDITOR_IDS, ADMIN_IDS, APPROVAL_IDS, BLACKLISTED_IDS, REPORTER_IDS, new_disabled
import database
import images
import utils
from bs4 import BeautifulSoup

with open('config/config.json', 'r') as f:
	config = json.loads(f.read())

routes = web.RouteTableDef()

s = aiohttp.ClientSession()


ibm_token = os.getenv('IBM_TOKEN')
ibm_url = os.getenv('IBM_URL')

if ibm_token:
	authenticator = IAMAuthenticator(ibm_token)
	language_translator = LanguageTranslatorV3(
			version='2018-05-01',
			authenticator=authenticator
	)

	language_translator.set_service_url(ibm_url)
else:
	print('no ibm translation token found, this is fine')
	language_translator = None

language_codes = {'af', 'ar', 'az', 'ba', 'be', 'bg', 'bn', 'ca', 'cs', 'cv', 'cy', 'da', 'de', 'el', 'en', 'eo', 'es', 'et', 'eu', 'fa', 'fi', 'fr', 'ga', 'gu', 'he', 'hi', 'hr', 'ht', 'hu', 'hy', 'is', 'it', 'ja', 'ka', 'kk', 'km', 'ko', 'ku', 'ky', 'lo', 'lt', 'lv', 'ml', 'mn', 'mr', 'ms', 'mt', 'my', 'nb', 'ne', 'nl', 'nn', 'pa', 'pa-PK', 'pl', 'ps', 'pt', 'ro', 'ru', 'si', 'sk', 'sl', 'so', 'sq', 'sr', 'sv', 'ta', 'te', 'th', 'tl', 'tr', 'uk', 'ur', 'vi', 'zh', 'zh-TW'}
	
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

translated_cache = {}

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
	
def admin_only(func):
    @functools.wraps(func)
    async def wrapper(request):
        sid_cookie = request.cookies.get('sid')
        if sid_cookie:
            discord_id = await database.get_editor_session(sid_cookie)
        else:
            discord_id = None
        if(not request.is_admin):
            raise web.HTTPUnauthorized()
	
        return await func(request)

    return wrapper

@routes.get('/')
async def index(request):
	sid_cookie = request.cookies.get('sid')
	if sid_cookie:
			discord_id = await database.get_editor_session(sid_cookie)
	else:
		discord_id = None
	entries = await database.get_entries(sort='last_edited',discord_id=discord_id)
	entry_count = await database.count_entries()
	return Template(
		'index.html',
		entries=entries,
		entry_count=entry_count
	)

@routes.get('/news')
async def news(request):
	sid_cookie = request.cookies.get('sid')
	if sid_cookie:
		discord_id = await database.get_editor_session(sid_cookie)
	else:
		discord_id = None
	if(not request.is_admin):
		raise web.HTTPUnauthorized()
	entries = await database.get_entries(sort='last_edited',discord_id=discord_id)
	entry_count = await database.count_entries()
	return Template(
		'news.html',
		entries=entries,
		entry_count=entry_count
	)

@routes.get('/admin')
@admin_only
async def admin_panel(request):
    entry_count = await database.count_entries()
    return Template(
		'admin/main.html',
		entry_count=entry_count
	)

@routes.get('/admin/users')
@admin_only
async def admin_users(request):
	entry_count = await database.count_entries()
	IDS = EDITOR_IDS + BLACKLISTED_IDS
	return Template(
		'admin/users.html',
		entry_count=entry_count,
		EDITOR_IDS=EDITOR_IDS,
		ADMIN_IDS=ADMIN_IDS,
		APPROVAL_IDS=APPROVAL_IDS,
		BLACKLISTED_IDS=BLACKLISTED_IDS,
		REPORTER_IDS=REPORTER_IDS,
		IDS=IDS,
		discord_id_to_user=discord_id_to_user
	)

@routes.get('/edit')
async def edit_entry(request):
	entry_id = request.query.get('id')
	entry_data = await database.get_entry(entry_id)
	if entry_data:
		title = entry_data.get('title', None)
		content = entry_data.get('content', '')
		unlisted = entry_data.get('unlisted', False)
		
	else:
		title = request.query.get('title')
		content = ''
		unlisted = True
	sid_cookie = request.cookies.get('sid')
	if sid_cookie:
		discord_id = await database.get_editor_session(sid_cookie)
	else:
		discord_id = None

	if not(entry_id or discord_id in ADMIN_IDS):
		pass#return web.Response(text="New entries are temporarily disabled. If you want to write a new entry, contact minx.")

	is_editor = discord_id in EDITOR_IDS
	if entry_data:
		if discord_id:
			if entry_data.get('owner_id') == int(discord_id):
				is_editor = True
	
	return Template(
		'edit.html',
		title=title,
		content=content,
		unlisted=unlisted,
		is_editor=is_editor,
		new_disabled=new_disabled
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
	if not entry_data:
		if new_disabled:
			return 'New entries are currently disabled'
	title = post_data.get('title') or entry_data.get('title')
	image = post_data.get('image')
	content = post_data['content']
	
	try:
		del translated_cache[entry_id]
	except: pass
		
	if request.is_admin:
		unlisted = post_data.get('unlisted', 'off') == 'on'
	elif entry_data:
		unlisted = entry_data.get("unlisted",False)
	else:
		unlisted = int(request.discord_id) in APPROVAL_IDS
		
	if image:
		image_url = await images.upload(image)
	else:
		image_url = None
	impersonate = False
	request.orig_id = None
	if request.is_admin:
		request.orig_id = request.discord_id
		request.discord_id = post_data.get('impersonate', request.discord_id)
		if str(request.discord_id).replace(' ', '') == '':
			request.discord_id = request.orig_id
		impersonate=True
		if(request.orig_id == request.discord_id):
			impersonate = False
	entry_id = await database.edit_entry(
		title=title,
		content=content,
		entry_id=entry_id,
		editor=request.discord_id,
		editor_real=request.orig_id,
		unlisted=unlisted,
		impersonate=impersonate,
		image=image_url
	)

	if not entry_data:
		if not impersonate:
			author=f"<@{request.discord_id}>"
		else:
			author = f"<@{request.orig_id}> impersonating <@{request.discord_id}>"
		if len(content) > 1020:
			content = content[:1020] + '...'
		if os.getenv('newentry_hook'):
			await s.post(os.getenv('newentry_hook'), json={'embeds': [{
				'title': 'New entry!',
				'url': 'https://repldex.com/entry/' + entry_id,
				'timestamp': datetime.now().isoformat(),
				'color': 0x2ecc71,
				'fields': [
					{'name': 'Author', 'value': author, 'inline': False},
					{'name': 'Title', 'value': title, 'inline': False},
					{'name': 'Content', 'value': content, 'inline': False},
					{'name': 'unlisted', 'value': str(unlisted), 'inline': False},
					{'name': 'id', 'content': entry_id},
					{'name': 'link', 'content': 'https://repldex.com/entry/' + entry_id}
				]
			}]})

	return web.HTTPFound(f'/entry/{entry_id}')

@routes.post('/revert')
async def revert_edit(request):
	'Reverts an entry to a former state'
	if not request.is_editor:
		return web.HTTPFound('/')
	entry_id = request.query.get('id')
	post_data = await request.json()

	print(post_data)

	entry_id = request.query.get('id')
	reverting_to_history_number = post_data['editNumber']

	entry_data = await database.get_entry(entry_id)

	entry_history = entry_data['history']
	
	old_title = entry_data['title']
	old_image = entry_data.get('image', {}).get('src')
	old_content = entry_data['content']
	unlisted = entry_data.get('unlisted', False)

	history_data = entry_history[reverting_to_history_number]

	new_title = history_data['title']
	new_image = history_data.get('image', {}).get('src')
	new_content = history_data['content']

	

	entry_id = await database.edit_entry(
		title=new_title,
		content=new_content,
		entry_id=entry_id,
		editor=request.discord_id,
		unlisted=unlisted,

		image=new_image
	)
	return web.HTTPFound(f'/entry/{entry_id}')


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
	entry_name = request.match_info.get('entry')
	entry_data = await database.get_entry(name=entry_name)

	if entry_data:
		entry_id = entry_data['_id']
		title = entry_data['title']
		content = entry_data.get('content', '[no content]')
		nohtml_content = entry_data.get('nohtml_content', '')
		unlisted = entry_data.get('unlisted', False)
		history = entry_data.get('history', [])
		image = entry_data.get('image')
	else:
		print(entry_name, 'not found')
		return web.HTTPNotFound()

	url_title = utils.url_title(title)

	if url_title != entry_name:
		if(not unlisted):
			print('Redirected', entry_name, 'to', url_title)
			return web.HTTPFound('/entry/' + url_title)
		else:
			print(f'{entry_name} ({url_title}) is unlisted so it was not redirected')

	sid_cookie = request.cookies.get('sid')
	if sid_cookie:
		discord_id = await database.get_editor_session(sid_cookie)
	else:
		discord_id = None
	is_editor = discord_id in EDITOR_IDS
	if discord_id:
		if entry_data.get('owner_id') == int(discord_id):
			is_editor = True

	article_text = None
	translated = False
  
	#ok you figure this out imma do templating
	article_text = None
	translated = False
	lang = None
	if_lang = request.query.get('lang',False) != False

	if lang in language_codes:
		try:
			cached = entry_id in translated_cache
			if cached:
				if lang in translated_cache[entry_id]:
					article_text=translated_cache[entry_id][lang]
					translated=True
					print('used lang translation cache')
				else:
					cached = False
			if not cached and language_translator:
				translation = language_translator.translate(
					text=nohtml_content,
					model_id='en-{}'.format(lang)).get_result()
				article_text = translation['translations'][0]['translation']
				try:
					translated_cache[entry_id][lang]=article_text
				except:
					translated_cache[entry_id]={lang:article_text}
				translated = True
				
		except Exception as e: print(e)
	elif if_lang:
		translated = True
		article_text = 'Translations are currently disabled'

	return Template(
		'entry.html',
		title=title,
		content=content,
		nohtml_content=nohtml_content,
		id=entry_id,
		unlisted=unlisted,
		history=history,
		image=image,
		is_editor=is_editor,
		back_location='/',
		article_text = article_text,
		translated=translated,
	)

@routes.get('/random')
async def random_entry(request):
	entry = await database.get_random_entry()
	
	return web.HTTPFound('/entry/' +entry['_id'])

@routes.get('/api/website-title')
async def api_website_title(request):
	url = request.query['url']

	if url.startswith('//'):
		url = 'https:' + url
	elif url[0] == '/':
		url = config.BASE_URL + url

	if url.startswith(config.BASE_URL):
		url = url[len(config.BASE_URL):]
		if url.startswith('/entry/'):
			entry_name = url[len('/entry/'):]
			entry = await database.get_entry(name=entry_name)
			return web.json_response({
				'title': entry['title'],
				'favicon': config.BASE_URL + '/static/icon.png',
				'content': entry['nohtml_content']
			})
		else:
			return web.json_response({})


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
		if 'is_editor' not in args:
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
		host=config.get('host', '0.0.0.0'),
		port=config.get('port', 8081)
	)
