import { APPLICATIONS_BASE_API_URL } from './interactions'
import type {
	APIApplicationCommandOption,
	APIInteractionResponseCallbackData,
} from 'discord-api-types/payloads/v9'
import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/rest/v9'
import type {
	APIInteractionDataResolvedChannel,
	APIInteractionDataResolvedGuildMember,
	APIRole,
} from 'discord-api-types'

// TODO: add subcommand groups https://discord.com/developers/docs/interactions/application-commands#subcommands-and-subcommand-groups

export const commands: Command<any>[] = []

export const GLOBAL_COMMAND_API_URL = `${APPLICATIONS_BASE_API_URL}/commands` as const

export const enum ApplicationCommandOptionType {
	Subcommand = 1,
	SubcommandGroup = 2,
	String = 3,
	Integer = 4,
	Boolean = 5,
	User = 6,
	Channel = 7,
	Role = 8,
	Mentionable = 9,
	Number = 10,
}

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

	handle(handler: typeof this.handler): void {
		this.handler = handler
		commands.push(this)
		console.log('added command')
	}
}

import '../bot'