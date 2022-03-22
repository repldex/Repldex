# API Documentation

## GET /api/entries.json
Search for entries

### Params
All parameters should of course be encoded in the request url as URL query string parameters.

Note: If there are no parameters, it will fetch all entries.

- **`tags`**: CSV (comma seperated values) of tags to search for. Eg: "web,programming language,discord user"
- **`query`**: String to search for in article titles and content.
- **`visible`**: Boolean (true/false) of whether to show regular (non unlisted or hidden), 'visible' entries. Defaults to true.
- **`unlisted`**: Boolean (true/false) of whether to show unlisted entries. Some users may not have the proper permissions to view these entries. Defaults to false.
- **`hidden`**: Boolean (true/false) of whether to show hidden entries. Some users may not have the proper permissions to view these entries. Defaults to false.
- **`limit`**: Integer of how many entries it should return. Defaults to all.
- **`skip`**: Integer of how many entries should be skipped (useful for pagination). Defaults to 0 (skip none).

## POST /api/entries.json
Creates entry. Probably should not try and do this programatically.

## GET /api/random.json
Get random entry.