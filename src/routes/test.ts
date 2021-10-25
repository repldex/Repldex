import type { RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v9'
import { commands, GLOBAL_COMMAND_API_URL } from '../lib/discord/api/commands'

async function registerCommands() {
	const bulkUpdate: RESTPutAPIApplicationCommandsJSONBody = commands.map(c => c.json)
	console.log(bulkUpdate)
}

registerCommands()
