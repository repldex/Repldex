import type {
	APIInteraction,
	APIInteractionDataResolvedChannel,
	APIInteractionResponse,
	APIRole,
} from 'discord-api-types/payloads/v9'
import { ApplicationCommandOptionType, InteractionData } from './commands'
import { verifyKey } from 'discord-interactions'
import config from '../../config'
import type { APIInteractionDataResolvedGuildMember, APIUser } from 'discord-api-types'

export const APPLICATIONS_BASE_API_URL =
	`https://discord.com/api/v9/applications/${config.discord_client_id}` as const

export function verifyInteraction(
	headers: Record<string, string>,
	rawBody: string | Uint8Array
): boolean {
	const signature = headers['x-signature-ed25519']
	const timestamp = headers['x-signature-timestamp']
	return verifyKey(rawBody ?? '', signature, timestamp, config.discord_public_key)
}

export async function handleInteraction(data: APIInteraction): Promise<APIInteractionResponse> {
	const commands = await import('./commands')
	switch (data.type) {
		// Ping
		case 1:
			return {
				// pong
				type: 1,
			}
		// ApplicationCommand
		case 2: {
			const matchingCommand = commands.commands.find(c => c.name === data.data.name)
			if (!matchingCommand)
				return {
					type: 4,
					data: { content: 'Unknown command' },
				}

			const interactionData: InteractionData<any> = {
				options: {},
			}

			const getChannel = (id: string): APIInteractionDataResolvedChannel | null =>
				(data.data.resolved as any)?.channels?.[id] ?? null
			const getRole = (id: string): APIRole | null =>
				(data.data.resolved as any)?.roles?.[id] ?? null
			const getMember = (id: string): (APIInteractionDataResolvedGuildMember & APIUser) | null => {
				const member = (data.data.resolved as any)?.members?.[id] ?? {}
				const user = (data.data.resolved as any)?.users?.[id] ?? {}
				if (Object.keys(user).length === 0) return null
				return { ...member, ...user }
			}

			// we have to do "as any" because the typings are wrong
			for (const option of (data.data as any).options) {
				let resolved = option.value
				switch (option.type) {
					case ApplicationCommandOptionType.Channel:
						// the typings do not include channels, they are wrong
						resolved = getChannel(option.value)
						break
					case ApplicationCommandOptionType.Mentionable:
						// the typings do not include channels, they are wrong
						resolved = getRole(option.value) ?? getChannel(option.value)
						break
					case ApplicationCommandOptionType.Role:
						resolved = getRole(option.value)
						break
					case ApplicationCommandOptionType.User:
						resolved = getMember(option.value)
						break
				}
				interactionData.options[option.name] = resolved
			}

			return {
				type: 4,
				data: await matchingCommand.handler(interactionData),
			}
		}
		// MessageComponent
		// case 3:
		// 	return {}
		default:
			throw new Error('Unknown interaction type')
	}
}