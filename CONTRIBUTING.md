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
