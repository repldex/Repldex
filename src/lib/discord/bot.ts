import { Command, ApplicationCommandOptionType } from './api/commands'
import { Entry, fetchEntries, fetchEntry, searchEntry } from '../database/entries'
import { createSlug } from '../database/index'
import { config } from '../config'

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
	.handle(async data => {
		console.log(data)
		let name: string = data.data.options.name
		let entry: Entry | null = await fetchEntry(createSlug(name))
		if (!entry) {
			return {
				embeds: [
					{
						title: "This entry does not exist"
						//description: "[Click here to write it!](there is no ?title= yet, so we will not implement this)"
					}
				]
			}
		}
		return {
			embeds: [
				{
					title: entry.title,
					url: config.base_url+'/entry/'+entry.slug,
					description: entry.content
				}
			]
		}
	})

new Command({
	name: 'random',
	description: 'View a random Repldex entry',
})
	.handle(async data => {
		console.log(data)
		let entries = await fetchEntries({
			limit: 0,
			skip: 0
		})
		let entry = entries[Math.floor(Math.random() * entries.length)]
		return {
			embeds: [
				{
					title: entry.title,
					url: config.base_url+'/entry/'+entry.slug,
					description: entry.content
				}
			]
		}
	})

//buttons for pagination here, probably?
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
	.handle(data => {
		console.log(data)
		return {
			content: "Ok"
		}
	})

new Command({
	name: 'source',
	description: 'Get a link to the source code of Repldex',
})
	.handle(data => {
		console.log(data)
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

console.log('bot')