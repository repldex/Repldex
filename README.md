[![Run on Repl.it](https://repl.it/badge/github/mat-1/ReplDex)](https://repl.it/github/mat-1/ReplDex)

# Repldex
Official encyclopedia of user created entries for the Replit Discord Server. Contains the Discord bot source code and `aiohttp` web server (API and frontend).

# Contributing
- Fork the repository and setup your enviornment. (`git clone` or otherwise).

Changing the Discord Bot:
- Create your own bot at the [Discord Dev Portal](https://discord.com/developers/docs).
- Create a MongoDB database (Atlas or otherwise). (Your URI should start with `mongodb+srv://`).
- Set your `.env` like so:

```ini
token="your-discord-bot-token"
client_secret="your-discord-client-secret"
dburi="mongodb-database-uri"
```
- Create a pull request describing what you changed.

# License
ReplDex is licensed under the MIT license
