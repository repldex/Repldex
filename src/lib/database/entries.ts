import type { Collection } from 'mongodb'
import { createUuid, getOrCreateCollection, ReplaceIdWithUuid, replaceUuidWithId } from '.'

export type Visibility = 'visible' | 'unlisted' | 'hidden'

export interface Entry {
	id: string
	title: string
	content: string
	slug: string
	visibility: Visibility
	createdAt: Date
}

async function getCollection(): Promise<Collection<ReplaceIdWithUuid<Entry>>> {
	return await getOrCreateCollection('entries')
}

interface FetchEntriesOptions {
	limit: number
	skip: number
	visible?: boolean
	unlisted?: boolean
	hidden?: boolean
	query?: string
}

/**
 * Fetch a number of entries
 */
export async function fetchEntries(options: FetchEntriesOptions): Promise<Entry[]> {
	const collection = await getCollection()
	const entries = await collection
		.find({
			visibility: {
				$in: [
					options.visible ?? true ? 'visible' : undefined,
					options.unlisted ?? false ? 'unlisted' : undefined,
					options.hidden ?? false ? 'hidden' : undefined,
				].filter(Boolean) as Visibility[],
			},
		})
		.skip(options.skip)
		.limit(options.limit)
		.toArray()
	return entries.map(replaceUuidWithId)
}

/**
 * Fetch an entry by its slug or id
 */
export async function fetchEntry(slug: string): Promise<Entry | null> {
	const collection = await getCollection()
	// fetch by the id if it looks like one, otherwise use the slug
	const entry = await collection.findOne(
		/^[0-9a-f]{32}$/i.test(slug)
			? { _id: createUuid(slug) }
			: { slug, visibility: { $ne: 'hidden' } }
	)
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
export async function createEntry(entry: Omit<Entry, 'id' | 'createdAt'>): Promise<Entry | null> {
	const collection = await getCollection()
	const entryId = createUuid()

	// add the id to the entry
	const newEntry: ReplaceIdWithUuid<Entry> = {
		...entry,
		_id: entryId,
		createdAt: new Date(),
	}

	// insert the entry into the database
	await collection.insertOne(newEntry)

	return replaceUuidWithId(newEntry)
}
