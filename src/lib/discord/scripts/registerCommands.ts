// this is a script that registers the commands by sending a request to the discord api
// this should only be run whenever a command is added, removed, or its syntax is changed

// https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands

console.log('register commands!')

import '../../../configureEnv'
import type { RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v9'
import '../bot'
import { commands, GLOBAL_COMMAND_API_URL } from '../api/commands'
import fetch from 'node-fetch'

async function registerCommands() {
	const bulkUpdate: RESTPutAPIApplicationCommandsJSONBody = commands.map(c => c.json)

	fetch(GLOBAL_COMMAND_API_URL, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
		},
		body: JSON.stringify(bulkUpdate),
	}).then(res => res.json())

	console.log('Registered commands, Please note that you only have to run this whenever the syntax of a command is changed, i.e. not on every code change. :)');
	process.exit(0)
}

registerCommands()