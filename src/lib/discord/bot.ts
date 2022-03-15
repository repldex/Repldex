import { Command, ApplicationCommandOptionType } from './api/commands'
import { Entry, fetchEntries, fetchEntry, countEntries } from '../database/entries'
import { createSlug } from '../database/index'

const BASE_URL = process.env.BASE_URL
if (!BASE_URL) throw new Error('BASE_URL environment variable not set')

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
		const name: string = i.options.name
		const entry: Entry | null = await fetchEntry(createSlug(name))
		if (!entry) {
			return {
				content: `Requested entry "${name}" does not exist, or is unavailable`,
				color: 16711680,
			}
		}

		let content: string
		if (entry.content.length > 985) {
			content = `${entry.content.slice(0, 985)}...`
		} else {
			content = entry.content
		}
		return {
			embeds: [
				{
					title: `${name}`,
					url: `${BASE_URL}/entry/${entry.slug}`,
					description: content,
					color: 16711680,
				},
			],
		}
	})

new Command({
	name: 'random',
	description: 'View a random Repldex entry',
}).handle(async data => {
	console.log(data)
	const entries = await fetchEntries({
		limit: 1,
		skip: Math.floor(Math.random() * (await countEntries())),
	})
	const entry = entries[Math.floor(Math.random() * entries.length)]
	return {
		embeds: [
			{
				title: entry.title,
				url: process.env.BASE_URL + '/entry/' + entry.slug,
				description: entry.content,
				color: 16711680,
			},
		],
	}
})

new Command({
	name: 'source',
	description: 'Get a link to the source code of Repldex',
}).handle(data => {
	console.log(data)
	return {
		embeds: [
			{
				title: 'Source',
				description: 'My source code is on [GitHub](https://github.com/mat-1/ReplDex)',
				color: 6621897,
				fields: [
					{
						name: 'Mat',
						value: 'Repldex Developer',
						inline: true,
					},
					{
						name: 'timchen',
						value: 'An Inspiration to All',
						inline: true,
					},
					{
						name: 'Coderman51',
						value: 'Repldex Developer',
						inline: true,
					},
					{
						name: 'Prussia',
						value: 'Repldex Developer',
						inline: true,
					},
					{
						name: 'Nayoar',
						value: 'Repldex Admin',
						inline: true,
					},
					{
						name: 'Kognise',
						value: 'Owns the domain',
						inline: true,
					},
					{
						name: 'selectthegang',
						value: 'Repldex Developer',
						inline: true,
					},
					{
						name: 'spotandjake',
						value: 'Repldex Developer (ish)',
						inline: true,
					},
					{
						name: 'Leon',
						value: 'undefined',
						inline: true,
					},
				],
				footer: {
					text: 'Also big thanks to all the editors and other contributors',
				},
			},
		],
	}
})

console.log('bot')
