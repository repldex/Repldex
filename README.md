[![Run on Repl.it](https://repl.it/badge/github/mat-1/ReplDex)](https://repl.it/github/mat-1/ReplDex)

# Repldex
\[Un\]official encyclopedia of user created entries for the Repl.it Community in general, but mainly the [Repl.it Discord Server](https://repl.it/discord). Contains the Discord bot source code and `aiohttp` web server (API and frontend).
500 entries and counting!

# Contributing
- Fork the repository and setup your enviornment. (`git clone` or otherwise).
- Or, click the run on repl.it badge

Changing the Discord Bot:
- Create your own bot at the [Discord Dev Portal](https://discord.com/developers/docs).
- Create a MongoDB database (Atlas or otherwise; your URI should start with `mongodb+srv://`).
- Set your `.env` like so:

```ini
token="your-discord-bot-token"
client_secret="your-discord-client-secret"
dburi="mongodb-database-uri"
```
- Create a pull request describing what you changed.
-wait for a reviewer to review your PR

# License
Repldex is licensed under the MIT license
