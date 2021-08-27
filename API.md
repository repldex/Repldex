# The Repldex API
The Repldex API allows you to perform several actions to get data for Repldex entries.

## Objects
### Entry
slug: The name of the entry in the urls, for example "Replit+Minecraft+Server". This changes if an entry is renamed.
id: The uuidv4 for the entry. This will never change.
title: The name of the entry.
html: The HTML content for the content of the entry. This is displayed on the website.
unlisted: Whether the entry is hidden from normal searches.
image: A URL for the image attached to the entry. Might be null.
markdown: The markdown for the content of the entry. This is displayed on the Discord bot.
no_html: The content of the entry without any formatting. This is used for the preview on the entry list.
owner_id: The Discord id of person who this entry is about. Might be null.

## Routes
### /api/entries/{sort}
This route is used to fetch entries, possibly using a search query. This will return an array of `Entry`s.
Path:
- sort: How the entries will be sorted. This can be either `last_edited` or `relevant`.
Parameters:
- page: The page number that you want to get the entries for, this is 0 indexed.
- limit: How many entries will be returned per page.
- query: The search query. This can either be the title, id, or a fuzzy match for titles and contents.

### /api/entry/{entry}
This route is used to fetch a single `Entry`, with only the first result of the search query being returned. If no entries match, the status will be a 404.
Path:
- entry: The search query. This can either be the title, the id, or a fuzzy match for the title and content.

### /api/selfentry/{owner_id}
This route is used to get an `Entry` about a certain Discord user.
Path:
- owner_id: The Discord ID of the user whose entry you want to get.
