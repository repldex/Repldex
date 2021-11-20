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
			embeds: [
				{
					title: "Source",
					description: "My source code is on [Github](https://github.com/mat-1/ReplDex)",
					color: "#650ac9",
					fields: [
						{
							name: "Mat1",
							value: "Project Head",
							inline: true
						},
						{
							name: "Coderman51",
							value: "Core Contributor",
							inline: true
						},
						{
							name: "Prussia",
							value: "Discord Bot Developer",
							inline: true
						},
						{
							name: "Nayoar",
							value: "Site Administrator",
							inline: true
						},
						{
							name: "Kognise",
							value: "Owns the domain",
							inline: true
						},
						{
							name: "Selectthemat",
							value: "Major contributor",
							inline: true
						}
					],
					footer: {
						text: "Also big thanks to all the editors and other contributors"
					}
				}
			]
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