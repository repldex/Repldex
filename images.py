import aiohttp

s = aiohttp.ClientSession()


async def upload(img):
    data = aiohttp.FormData()
    data.add_field("image", img.file, content_type=img.content_type)
    async with s.post(
        "https://i.matdoes.dev/api/upload",
        data=data,
    ) as r:
        image_json = await r.json()
        image_url = image_json["url"]
    return image_url


async def get_data(url):
    data_url = url.replace("/image/", "/json/")
    async with s.get(data_url) as r:
        data = await r.json()
    return {
        "thumbnail_b64": data.get("thumbnail_b64"),
        "src": url,
        "thumbnail_content_type": data.get("thumbnail-content-type", "image/webp"),
    }
