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
	name: 'search',
	description: 'Search Repldex entries',
})
	.addOption({
		name: 'query',
		description: 'Query to search for',
		type: ApplicationCommandOptionType.String,
		required: true,
	})
	.handle(async data => {
		console.log(data)
		const query: string = i.options.query
		let entries = await searchEntry(query)
		entries = entries.slice(0, 10)
		const embed: APIEmbed = {
			title: `Search Results for ${query}`,
			fields: [],
			footer: {
				text: 'Page 1',
			},
		}
		for (const entry of entries) {
			embed.fields.push({
				name: entry.title,
				value: `[Link](${process.env.BASE_URL}/entry/${entry.slug})`,
			}),
		}
		//note: as of now buttons just sit around. clicking on them does not do anything
		return {
			components: [
				{
					//buttons must be in an action row.... why? blame discord
					type: 1,
					components: [
						{
							//type 2 = button
							type: 2,
							style: 1,
							label: 'Back',
							emoji: {
								id: null,
								name: '◀️',
							},
							//command-button-page-query
							custom_id: `search-back-1-${query}`,
						},
						{
							type: 2,
							style: 1,
							label: 'Forward',
							emoji: {
								id: null,
								name: '▶️',
							},
							custom_id: `search-forward-1-${query}`,
						},
					],
				},
			],
			embeds: [embed],
		}
	})
	.handleComponents(async args => {
		const action = args[0]
		//`+` is unary operator that converts to int
		let page: number = +args[1]
		const query = args[2]
		let entries = await searchEntry(query)
		if (action == 'back') {
			page--
			if (page == 0) {
				page = 1
			}
		} else if (action == 'forward') {
			const max_pages = Math.ceil(entries.length / 10)
			if (!(page + 1 > max_pages)) {
				page++
			}
		}
		entries = entries.slice((page - 1) * 10, page * 10)
		const embed: APIEmbed = {
			title: `Search Results for ${query}`,
			fields: [],
			footer: {
				text: `Page ${String(page)}`,
			},
		}
		for (const entry of entries) {
			embed.fields.push({
				name: entry.title,
				value: `[Link](${process.env.BASE_URL}/entry/${entry.slug})`,
			})
		}
		return {
			components: [
				{
					//buttons must be in an action row.... why? blame discord
					type: 1,
					components: [
						{
							//type 2 = button
							type: 2,
							style: 1,
							label: 'Back',
							emoji: {
								id: null,
								name: '◀️',
							},
							//command-button-page-query
							custom_id: `search-back-${String(page)}-${query}`,
						},
						{
							type: 2,
							style: 1,
							label: 'Forward',
							emoji: {
								id: null,
								name: '▶️',
							},
							custom_id: `search-format-${String(page)}-${query}`,
						},
					],
				},
			],
			embeds: [embed],
		}
	})

new Command({
	name: 'source',
	description: 'Get a link to the source code of Repldex',
}).handle(data => {
	return {
		embeds: [
			{
				title: 'Source',
				description: 'My source code is on [GitHub](https://github.com/repldex/Repldex)',
				color: 6621897,
				fields: [
					{
						name: 'mat',
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