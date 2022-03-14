import { verifyKey } from 'discord-interactions'
import type { APIInteractionResponse, APIMessageInteraction } from 'discord-api-types/payloads/v9'
import { commands } from './commands'

export const APPLICATIONS_BASE_API_URL =
	`https://discord.com/api/v9/applications/${process.env.DISCORD_CLIENT_ID}` as const

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY
if (DISCORD_PUBLIC_KEY) throw new Error('DISCORD_PUBLIC_KEY environment variable not set')

export function verifyInteraction(
	headers: Record<string, string>,
	rawBody: string | Uint8Array
): boolean {
	const signature = headers.get('x-signature-ed25519')
	const timestamp = headers.get('x-signature-timestamp')
	if (!signature || !timestamp) return false
	return verifyKey(rawBody ?? '', signature, timestamp, DISCORD_PUBLIC_KEY!)
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
			if (!commands[data.data.name]) {
				return {
					type: 4,
					data: { content: 'Unknown command' },
				}
			}
			return {
				type: 4,
				data: commands[data.data.name].handler(data.data),
			}
		// MessageComponent
		case 3:
			//variable decs in case blocks not allowed, pparently
			//const id_args = data.custom_id.split('-')
			//const command = id_args.shift()
			return {
				type: 7,
				data: commands[data.custom_id.split('-')[0]].component_handler(
					data.custom_id.split('-').slice(1)
				),
			}
		default:
			throw new Error('Unknown interaction type')
	}
}
