import { Command } from './api/commands'
import { Entry, fetchEntries, fetchEntry, countEntries } from '../database/entries'
import { createSlug } from '../database/index'
import {
	APIEmbed,
	APIInteractionResponseCallbackData,
	ApplicationCommandOptionType,
	ButtonStyle,
	ComponentType,
} from 'discord-api-types/payloads/v9'

const BASE_URL = process.env.BASE_URL
if (!BASE_URL) throw new Error('BASE_URL environment variable not set')

// NOTE: run `npm run register-commands` any time you make a change a command's metadata such as name, description, or choices
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
	.handle(async data => {
		const name: string = data.options.name
		const entry: Entry | null = await fetchEntry(createSlug(name))
		if (!entry) {
			return {
				content: `Requested entry "${name}" does not exist, or is unavailable.`,
				color: 0x650ac9,
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
					title: name,
					url: `${BASE_URL}/entry/${entry.slug}`,
					description: content,
					color: 0x650ac9,
				},
			],
		}
	})

new Command({
	name: 'random',
	description: 'View a random Repldex entry',
}).handle(async _data => {
	const entryCount: number = await countEntries()
	const entries = await fetchEntries({
		limit: 1,
		skip: Math.floor(Math.random() * entryCount),
	})
	const entry = entries[0]

	return {
		embeds: [
			{
				title: entry.title,
				url: `${BASE_URL}/entry/${entry.slug}`,
				description: entry.content,
				color: 0x650ac9,
			},
		],
	}
})

async function createSearchResult(
	query: string,
	page: number
): Promise<APIInteractionResponseCallbackData> {
	const entryCount = await countEntries()

	const entries = await fetchEntries({
		query: query,
		limit: 10,
		skip: (page - 1) * 10,
	})
	let description = ''
	let entryNum = 0
	for (const entry of entries) {
		entryNum = entryNum + 1
		description += `${entryNum}) [${entry.title}](${BASE_URL}/entry/${entry.slug})\n`
	}
	const embed: APIEmbed = {
		title: `Search Results for ${query}`,
		description: entries.length > 0 ? description : 'No results found.',
		footer: {
			text: `Page ${page}`,
		},
	}
	return {
		components: [
			{
				// buttons must be in an action row.... why? blame discord
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.Button,
						style: ButtonStyle.Primary,
						label: 'Back',
						emoji: {
							name: '◀️',
						},
						// command-button-page-query
						custom_id: `search-back-${page}-${query}`,
						disabled: page === 1,
					},
					{
						type: ComponentType.Button,
						style: ButtonStyle.Primary,
						label: 'Forward',
						emoji: {
							name: '▶️',
						},
						custom_id: `search-format-${page}-${query}`,
						disabled: page === Math.ceil(entryCount / 10),
					},
				],
			},
		],
		embeds: [embed],
	}
}

new Command({
	name: 'search',
	description: 'Search for Repldex entries',
})
	.addOption({
		name: 'query',
		description: 'Query to search for',
		type: ApplicationCommandOptionType.String,
		required: true,
	} as const)
	.handle(async data => {
		// query should always be a string. probably a better way to do this
		if (typeof data.options.query !== 'string') throw new Error('Custom ID is invalid')
		const query: string = data.options.query

		return await createSearchResult(query, 1)
	})
	.handleComponents(async args => {
		const action = args[0]
		let page = parseInt(args[1])
		const query = args[2]

		if (action == 'back') {
			page--
		} else if (action == 'forward') {
			page++
		}

		return await createSearchResult(query, page)
	})

new Command({
	name: 'source',
	description: 'Get a link to the source code of Repldex',
}).handle(_data => {
	return {
		embeds: [
			{
				title: 'Source',
				description: 'My source code is on [GitHub](https://github.com/repldex/Repldex).',
				color: 0x650ac9,
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
					text: 'Also, big thanks to all the editors and other contributors.',
				},
			},
		],
	}
})

console.log('bot')
