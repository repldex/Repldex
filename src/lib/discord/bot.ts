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
	})

new Command({
	name: 'selfentry',
	description: 'View a Repldex entry via owner username',
})
	.addOption({
		name: 'User',
		description: 'The owner of the entry',
		type: ApplicationCommandOptionType.User,
		required: true,
	})
	.handle(i => {
		console.log(i)
	})

new Command({
	name: 'random',
	description: 'View a random Repldex entry',
}).handle(i => {
	console.log(i)
})

new Command({
	name: 'featured',
	description: 'View the featured Repldex entry',
}).handle(i => {
	console.log(i)
})

console.log('bot')
