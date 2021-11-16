import { Command, ApplicationCommandOptionType } from './api/commands'

new Command({
	name: 'entry',
	description: 'View a Repldex entry',
})
	.addOption({
		name: 'name',
		description: 'The name of the entry',
		type: ApplicationCommandOptionType.String,
		required: true,
	})
	.handle(i => {
		console.log(i)
		return {
			content: "Ok"
		}
	})

console.log('bot')
