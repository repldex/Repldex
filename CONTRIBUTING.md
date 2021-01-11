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
