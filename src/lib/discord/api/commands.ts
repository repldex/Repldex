import { APPLICATIONS_BASE_API_URL } from './interactions'
import type {
	APIApplicationCommandInteraction,
	APIApplicationCommandOption,
	APIInteractionResponseCallbackData,
	APIMessage,
	APIEmbed
} from 'discord-api-types/payloads/v9'
import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/rest/v9'
import config from '../../config'

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

export const commands: { [key: string]: Command } = {}

export class Command {
	json: RESTPostAPIChatInputApplicationCommandsJSONBody
	name: string
	//
	handler: (interaction: APIApplicationCommandInteraction) => APIInteractionResponseCallbackData | Promise<APIInteractionResponseCallbackData>
	component_handler: (args: []) => APIInteractionResponseCallbackData | Promise<APIInteractionResponseCallbackData>

	constructor(options: CommandOptions) {
		this.name = options.name
		commands[this.name] = this
		this.json = {
			// ChatInput
			type: 1,
			options: [],
			...options,
		}
	}

	addOption(option: Omit<APIApplicationCommandOption, 'type'> & { type: number }): this {
		this.json.options!.push(option as APIApplicationCommandOption)
		return this
	}

	handle(handler: (interaction: APIApplicationCommandInteraction) => {}): this {
		this.handler = handler
		console.log('added command')
		return this
	}

	handle_components(component_handler: (interaction: APIApplicationCommandInteraction) => {}): this {
		this.component_handler = component_handler;
		return this
	}
}