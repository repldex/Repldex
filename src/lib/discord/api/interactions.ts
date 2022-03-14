import { verifyKey } from 'discord-interactions'
import type { APIInteractionResponse, APIMessageInteraction } from 'discord-api-types/payloads/v9'
import { commands } from './commands'

export const APPLICATIONS_BASE_API_URL =
	`https://discord.com/api/v9/applications/${process.env.discord_client_id}` as const

// const clientSecret = process.env['DISCORD_CLIENT_SECRET']
// if (!clientSecret) throw new Error('DISCORD_CLIENT_SECRET environment variable not set')

export function verifyInteraction(
	headers: Record<string, string>,
	rawBody: string | Uint8Array
): boolean {
	const signature = headers['x-signature-ed25519']
	const timestamp = headers['x-signature-timestamp']
	return verifyKey(rawBody ?? '', signature, timestamp, process.env.discord_public_key)
}

export async function handleInteraction(
	data: APIMessageInteraction
): Promise<APIInteractionResponse> {
	console.log(data)
	switch (data.type) {
		// Ping
		case 1:
			return {
				// pong
				type: 1,
			}
		// ApplicationCommand
		case 2:
			return {
				type: 4,
				data: commands[data.data.name].handler(data.data),
			}
		// MessageComponent
		case 3:
			let id_args = data.custom_id.split('-');
			let command = id_args.shift();
		 	return {
				type: 7,
				data: commands[command].component_handler(id_args)
			}
		default:
			throw new Error('Unknown interaction type')
	}
}