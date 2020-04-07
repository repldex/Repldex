import aiohttp

async def upload(img):
	data = aiohttp.FormData()
	data.add_field('image',
	  img.file,
		content_type=img.content_type
  )
	async with aiohttp.ClientSession() as s:
		async with s.post(
			'https://i.matdoes.dev/api/upload',
			data=data,
		) as r:
			image_json = await r.json()
			image_url = image_json['url']
	return image_url

async def get_data(url):
	# print('converting image')
	data_url = url.replace('/image/', '/json/')
	async with aiohttp.ClientSession() as s:
		r = await s.get(data_url)
		data = await r.json()
	# print(url)
	return {
		'thumbnail_b64': data.get('thumbnail_b64'),
		'src': url,
		'thumbnail_content_type': data.get('thumbnail-content-type', 'image/webp')
	}