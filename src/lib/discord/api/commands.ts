import { APPLICATIONS_BASE_API_URL } from './interactions'
import type {
	APIApplicationCommandOption,
	APIInteractionResponseCallbackData,
	ApplicationCommandOptionType,
	APIInteractionDataResolvedChannel,
	APIInteractionDataResolvedGuildMember,
	APIRole,
} from 'discord-api-types/payloads/v9'
import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/rest/v9'

// TODO: add subcommand groups https://discord.com/developers/docs/interactions/application-commands#subcommands-and-subcommand-groups

export const commands: Command<any>[] = []

export const GLOBAL_COMMAND_API_URL = `${APPLICATIONS_BASE_API_URL}/commands` as const

// we don't want the user to have to specify the type here
type CommandOptions = Omit<RESTPostAPIChatInputApplicationCommandsJSONBody, 'type'>

type CommandTypeIdToResolved<Type> = Type extends ApplicationCommandOptionType.Boolean
	? boolean
	: Type extends ApplicationCommandOptionType.Channel
	? APIInteractionDataResolvedChannel
	: Type extends ApplicationCommandOptionType.Integer
	? number
	: Type extends ApplicationCommandOptionType.Mentionable
	? APIInteractionDataResolvedGuildMember | APIRole
	: Type extends ApplicationCommandOptionType.Number
	? number
	: Type extends ApplicationCommandOptionType.Role
	? APIRole
	: Type extends ApplicationCommandOptionType.String
	? string
	: Type extends ApplicationCommandOptionType.Subcommand
	? string // this is wrong, it's not a string
	: Type extends ApplicationCommandOptionType.SubcommandGroup
	? string // this is wrong, it's not a string
	: Type extends ApplicationCommandOptionType.User
	? APIInteractionDataResolvedGuildMember
	: never

export interface InteractionData<T extends APIApplicationCommandOption[]> {
	options: {
		[arg in T[number] as arg['name']]: arg['required'] extends true
			? CommandTypeIdToResolved<arg['type']>
			: CommandTypeIdToResolved<arg['type']> | null
	}
}

export class Command<T extends APIApplicationCommandOption[] = []> {
	json: RESTPostAPIChatInputApplicationCommandsJSONBody
	name: string
	handler: (
		interaction: InteractionData<T>
	) => APIInteractionResponseCallbackData | Promise<APIInteractionResponseCallbackData>
	componentHandler: (
		args: string[]
	) => APIInteractionResponseCallbackData | Promise<APIInteractionResponseCallbackData>

	constructor(options: CommandOptions) {
		this.name = options.name
		this.json = {
			// ChatInput
			type: 1,
			options: [],
			...options,
		}
	}

	addOption<O extends Omit<APIApplicationCommandOption, 'type'> & { type: number }>(
		option: O
	): Command<[...T, O]> {
		this.json.options!.push(option)
		return this as unknown as Command<[...T, O]>
	}

	// have it return the command so these can be chained eg .handle().handleComponents()
	handle(handler: typeof this.handler): Command<T> {
		this.handler = handler
		commands.push(this)
		console.log('added command')
		return this
	}

	handleComponents(componentHandler: typeof this.componentHandler): Command<T> {
		this.componentHandler = componentHandler
		console.log('added component handler')
		return this as unknown as Command<T>
	}
}

import '../bot'
