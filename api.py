from aiohttp import web
import aiohttp
from datetime import datetime
from bs4 import BeautifulSoup
import json

import database
import config
import utils

s = aiohttp.ClientSession()

class CustomRouteDef(web.RouteTableDef):
	def __init__(self, prepend="") -> None:
		super().__init__()
		self.prepend = prepend
	def route(self, method: str, path: str, **kwargs):
		prepend = 'prepend'
		if(kwargs.get(prepend,True)==True):
			path = self.prepend + path
		if(prepend in list(kwargs.keys())): 
			del kwargs[prepend]
		return super().route(method, path, **kwargs)
api = CustomRouteDef('/api')

def json_serial(obj):
	if isinstance(obj, (datetime)):
		return obj.isoformat()

def json_response(d):
	return web.Response(
		text=json.dumps(d, default=json_serial),
		content_type='application/json'
	)



@api.get('/entries/{sort}')
async def api_entries_new(request):
	page = int(request.query.get('page', 0))
	limit = int(request.query.get('limit', 20))
	query = request.query.get('query')
	sort = request.match_info['sort']
	if sort == 'new':
		sort = 'last_edited'
	if sort == 'search':
		sort = 'relevant'
	raw_entries = await database.get_entries(
		sort=sort,
		page=page,
		limit=limit,
		query=query
	)
	entries = []
	for entry in raw_entries:
		entry = await create_response(entry, preview=True)
		entries.append(entry)
	return json_response(entries)

async def create_response(entry_data, preview=False):
	if entry_data:
		entry_id = entry_data['_id']
		title = entry_data['title']
		content = entry_data.get('content', '[no content]')
		unlisted = entry_data.get('unlisted', False)
		image = entry_data.get('image')
		markdown = entry_data.get('markdown')
		no_html = entry_data.get('nohtml_content')
		content = await utils.before_show_text(content)
		markdown = utils.html_to_markdown(content)
		owner_id = entry_data.get('owner_id')
	else:
		return web.HTTPNotFound()

	url_title = utils.url_title(title)

	if preview:
		return {
			'title': title,
			'preview': utils.remove_html(content),
			'html': content,
			'id': entry_id,
			'image': image
		}
	else:
		return {
			'slug': url_title,
			'id': entry_id,
			'title': title,
			'html': content,
			'unlisted': unlisted,
			'image': image,
			'markdown': markdown,
			'no_html': no_html,
			'owner_id': owner_id,
		}


@api.get('/entry/{entry}')
async def api_entry(request):
	entry_name = utils.url_title(request.match_info.get('entry'))
	entry_data = await database.get_entry(name=entry_name)

	data = await create_response(entry_data)
	if not data:
		raise web.HTTPNotFound()
	if data['slug'] != entry_name:
		return web.HTTPFound('/api/entry/' + data['slug'])

	return json_response(data)

@api.get('/selfentry/{owner_id}')
async def api_selfentry(request):
	owner_id = int(request.match_info['owner_id'])
	entry_data = await database.get_entry(
		owner=owner_id
	)
	data = await create_response(entry_data)
	return json_response(data)

@api.get('/website-title')
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
