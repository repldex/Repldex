import type { Collection } from 'mongodb'
import { createUuid, getDatabase, ReplaceIdWithUuid, replaceUuidWithId } from '.'

export interface Entry {
	id: string
	title: string
	content: string
	slug: string
	createdAt: Date
}

async function getCollection(): Promise<Collection<ReplaceIdWithUuid<Entry>>> {
	const db = await getDatabase()
	return db.collection('entries')
}

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
