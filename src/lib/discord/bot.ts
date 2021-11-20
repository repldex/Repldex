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

new Command({
	name: 'random',
	description: 'View a random Repldex entry',
})
	.handle(i => {
		console.log(i)
		return {
			content: "Ok"
		}
	})

new Command({
	name: 'newentry',
	description: 'Get link to make a new entry',
})
	.addOption({
		name: 'name',
		description: 'The name of the new entry',
		type: ApplicationCommandOptionType.String,
		required: true,
	})
	.handle(i => {
		console.log(i)
		return {
			content: "Ok"
		}
	})

new Command({
	name: 'search',
	description: 'Search Repldex entries',
})
	.addOption({
		name: 'query',
		description: 'Query to search for',
		type: ApplicationCommandOptionType.String,
		required: true,
	})
	.handle(i => {
		console.log(i)
		return {
			content: "Ok"
		}
	})

new Command({
	name: 'source',
	description: 'Get a link to the source code of Repldex',
})
	.handle(i => {
		console.log(i)
		return {
			content: "Ok"
		}
	})

new Command({
	name: 'ping',
	description: 'View ping',
})
	.handle(i => {
		console.log(i)
		return {
			content: "Ok"
		}
	})

console.log('bot')