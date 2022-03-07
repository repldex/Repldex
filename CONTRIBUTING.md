# Contributing

If the change you'd like to make is simple enough such as fixing a tpyo, you can simply fork the repo, edit the file using GitHub's online editor, and make a pull request.
Otherwise, use the following instructions:

1. Fork the repository and clone it with Git.
2. Navigate to the directory in your terminal and run `npm i` to install the necessary packages.
3. Create your Discord bot at the [Discord Developer Portal applications page](https://discord.com/developers/applications).
4. Create a MongoDB database. (Tip: use [Atlas](https://www.mongodb.com/atlas/database) for a free database).
5. Rename the [.env.example](.env.example) file to .env and fill in the fields.
6. Run `npm run dev` to open your server at `http://localhost:3000`. This will automatically update as you change your code so you don't need to rerun the command.
7. Make your changes, you can look at the [file structure overview](#file-structure) if you're not sure where you should be.
8. Once you're satisfied with your changes, create a commit and make a [pull request](https://github.com/repldex/Repldex/pulls).

### Enviornment Variables (.env)

```DISCORD_CLIENT_ID``` - Discord Client ID

```DISCORD_CLIENT_SECRET``` - Discord Client Secret

```DISCORD_PUBLIC_KEY``` - Discord Public Key

```DISCORD_TOKEN``` - Discord BOT Token

```JWT_SECRET``` - JWT Secret

```MONGODB_URL``` - MongoDB URI

```NODE_ENV``` - Node Environment (this can be "production" or "development", optional)

## File structure

Here's an overview of some of the directories and important files in the project.

- `src/`
  - Source code is here.
  - `src/hooks/`
    - Svelte thing, not yet implemented.
  - `src/lib/`
    - Svelte components and other code.
    - `src/lib/database/`
      - Code that interfaces directly with the database or helps with database operations.
    - `src/lib/discord/`
      - Code relevant to the Discord API and the bot.
      - `src/lib/discord/api/`
        - Code that interfaces and abstracts the Discord API.
  - `src/routes/`
    - Each file here is a different HTTP route, the .svelte files are for HTML and the .ts files are for other stuff.
    - `src/routes/api/`
      - All the API routes are here.
      - _discordinteraction.ts_ - This is the webhook where Discord notifies us whenever someone uses an interaction.
    - _\_\_error.svelte_ - This is the error page, used for 404s, etc.
    - _\_\_layout.svelte_ - Layout for all pages. If you want to add something to all pages, go here.
- `static/` - Some of the static files are here, this will probably change in the future.
