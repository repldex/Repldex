import { verifyKey } from 'discord-interactions'
import config from '$lib/config'
import type { APIInteractionResponse, APIMessageInteraction } from 'discord-api-types/payloads/v9'

export const APPLICATIONS_BASE_API_URL =
	`https://discord.com/api/v9/applications/${config.discord_client_id}` as const

// const clientSecret = process.env['DISCORD_CLIENT_SECRET']
// if (!clientSecret) throw new Error('DISCORD_CLIENT_SECRET environment variable not set')

export function verifyInteraction(
	headers: Record<string, string>,
	rawBody: string | Uint8Array
): boolean {
	const signature = headers['x-signature-ed25519']
	const timestamp = headers['x-signature-timestamp']
	return verifyKey(rawBody ?? '', signature, timestamp, config.discord_public_key)
}

export async function handleInteraction(
	data: APIMessageInteraction
): Promise<APIInteractionResponse> {
	switch (data.type) {
		// ping
		case 1:
			return {
				// pong
				type: 1,
			}

		default:
			throw new Error('Unknown interaction type')
	}
}
