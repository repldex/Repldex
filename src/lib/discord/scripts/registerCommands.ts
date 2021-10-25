// this is a script that registers the commands by sending a request to the discord api
// this should only be run whenever a command is added, removed, or its syntax is changed

// https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands

import type { RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v9'
import { commands, GLOBAL_COMMAND_API_URL } from '../api/commands'

async function registerCommands() {
	const bulkUpdate: RESTPutAPIApplicationCommandsJSONBody = commands.map(c => c.json)
	const json = await fetch(GLOBAL_COMMAND_API_URL, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(bulkUpdate),
	}).then(res => res.json())
	console.log(json)
}

registerCommands()
