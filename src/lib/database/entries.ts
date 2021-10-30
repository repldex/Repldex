import type { Collection } from 'mongodb'
import { createUuid, getDatabase, ReplaceIdWithUuid, replaceUuidWithId } from '.'

export interface Entry {
	id: string
	title: string
	content: string
	slug: string
}

async function getCollection(): Promise<Collection<ReplaceIdWithUuid<Entry>>> {
	const db = await getDatabase()
	return db.collection('entries')
}

const dummyEntries: Entry[] = [
	{
		id: 'a',
		title: 'foobar',
		slug: 'foobar',
		content:
			'The terms foobar (/ˈfuːbɑːr/), foo, bar, baz, and others are used as metasyntactic variables and placeholder names in computer programming or computer-related documentation. They have been used to name entities such as variables, functions, and commands whose exact identity is unimportant and serve only to demonstrate a concept.',
	},
	{
		id: 'b',
		title: 'Lorem ipsum',
		slug: 'lorem-ipsum',
		content:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras arcu ipsum, rhoncus a augue a, auctor euismod odio. Etiam sit amet vulputate libero. Maecenas eu nulla nibh. Quisque at urna rhoncus, dignissim risus vel, congue nisl. Fusce non maximus lacus. Nunc aliquam nulla a tempor vestibulum. Maecenas laoreet pharetra diam. Donec sit amet lorem a sapien luctus suscipit. Nunc convallis scelerisque massa eu sollicitudin. Phasellus convallis tempus metus, at tempor ligula faucibus sit amet. Nam ut lectus et elit aliquet fermentum. Nullam vehicula mi in dui fermentum, sed cursus sem sollicitudin. Nam sagittis malesuada augue, et finibus est auctor eget.',
	},
]

interface FetchEntriesOptions {
	limit: number
	skip: number
	query?: string
}

/**
 * Fetch a number of entries
 */
export async function fetchEntries(options: FetchEntriesOptions): Promise<Entry[]> {
	const collection = await getCollection()
	const entries = await collection.find({}).skip(options.skip).limit(options.limit).toArray()
	return entries.map(replaceUuidWithId)
}

/**
 * Fetch an entry by its slug
 */
export async function fetchEntry(slug: string): Promise<Entry | null> {
	const collection = await getCollection()
	const entry = await collection.findOne({ slug })
	return entry ? replaceUuidWithId(entry) : null
}

/**
 * Edit an entry
 */
export async function editEntry(
	entryId: string,
	entry: Partial<Omit<Entry, 'id'>>
): Promise<Entry | null> {
	const collection = await getCollection()
	const result = await collection.findOneAndUpdate(
		{ _id: createUuid(entryId) },
		{ $set: entry },
		{ returnDocument: 'after' }
	)

	return result.value ? replaceUuidWithId(result.value) : null
}

/**
 * Create an entry
 */
export async function createEntry(entry: Omit<Entry, 'id'>): Promise<Entry | null> {
	const collection = await getCollection()
	const entryId = createUuid()

	// add the id to the entry
	const newEntry = { ...entry, _id: entryId }

	// insert the entry into the database
	await collection.insertOne(newEntry)

	return replaceUuidWithId(newEntry)
}

/**
 * Search for a list of entries by name and content, sorted by relevance
 */
export async function searchEntries(query: string): Promise<Entry[]> {
	return dummyEntries
		.filter(e => e.title.includes(query))
		.sort((a, b) => a.title.length - b.title.length)
}
