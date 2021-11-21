import { Command, ApplicationCommandOptionType } from './api/commands'

// NOTE: do `npm run register-commands` if you change the syntax of any command

new Command({
	name: 'entry',
	description: 'View a Repldex entry',
})
	.addOption({
		name: 'name',
		description: 'The name of the entry',
		type: ApplicationCommandOptionType.String,
		required: true,
	} as const)
	.handle(async i => {
		return {
			embeds: [
				{
					title: `Entry "${i.options.name}"`,
				},
			],
		}
	})

console.log('bot')
