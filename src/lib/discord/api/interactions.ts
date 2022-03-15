import type {
	APIInteraction,
	APIInteractionDataResolvedChannel,
	APIInteractionResponse,
	APIRole,
} from 'discord-api-types/payloads/v9'
import { ApplicationCommandOptionType, InteractionData } from './commands'
import { verifyKey } from 'discord-interactions'
import type { APIInteractionDataResolvedGuildMember, APIUser } from 'discord-api-types'

export const APPLICATIONS_BASE_API_URL =
	`https://discord.com/api/v9/applications/${process.env.DISCORD_CLIENT_ID}` as const

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY
if (!DISCORD_PUBLIC_KEY) throw new Error('DISCORD_PUBLIC_KEY environment variable not set')

export function verifyInteraction(
	headers: Headers,
	rawBody: string | Uint8Array | ArrayBuffer
): boolean {
	const signature = headers.get('x-signature-ed25519')
	const timestamp = headers.get('x-signature-timestamp')
	if (!signature || !timestamp) return false
	return verifyKey(rawBody ?? '', signature, timestamp, DISCORD_PUBLIC_KEY!)
}

export async function handleInteraction(data: APIInteraction): Promise<APIInteractionResponse> {
	const commands = await import('./commands')
	switch (data.type) {
		// Ping
		case 1:
			return {
				// Pong!
				type: 1,
			}
		// Application Command
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
			if (data.data?.options) {
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
			}

			return {
				type: 4,
				data: await matchingCommand.handler(interactionData),
			}
		}

		// MessageComponent
		case 3: {
			return {
				type: 7,
				data: commands.commands
					.find(c => c.name === data.custom_id.split('-')[0])
					.componentHandler(data.custom_id.split('-').slice(1)),
			}
		}

		default:
			throw new Error('Unknown interaction type')
	}
}
