import { createUuid, getDatabase, ReplaceIdWithUuid, replaceUuidWithId } from '.'
import type { Collection, Filter } from 'mongodb'

export type Visibility = 'visible' | 'unlisted' | 'hidden'

export interface Entry {
	id: string
	title: string
	content: string
	slug: string
	visibility: Visibility
	createdAt: Date
	editedAt: Date
  tags: string[]
}

let triedCreatingSearchIndex = false
async function getCollection(): Promise<Collection<ReplaceIdWithUuid<Entry>>> {
	const db = await getDatabase()
	const coll = db.collection<ReplaceIdWithUuid<Entry>>('entries')
	if (!triedCreatingSearchIndex) {
		triedCreatingSearchIndex = true
		await coll.createIndex({ title: 'text', content: 'text' })
	}
	return coll
}

interface FilterEntriesOptions {
	visible?: boolean
	unlisted?: boolean
	hidden?: boolean
	query?: string
}

interface FetchEntriesOptions extends FilterEntriesOptions {
	limit: number
	skip: number
	tags?: string[]
}

/**
 * Fetch a number of entries
 */
export async function fetchEntries(options: FetchEntriesOptions): Promise<Entry[]> {
	const collection = await getCollection()
	const searchQuery = options.query
	const skip = options.skip
	const limit = options.limit
	const tags = options.tags

	const searchFilter: Filter<ReplaceIdWithUuid<Entry>> = {
		visibility: {
			$in: [
				options.visible ?? true ? 'visible' : undefined,
				options.unlisted ?? false ? 'unlisted' : undefined,
				options.hidden ?? false ? 'hidden' : undefined,
			].filter(Boolean) as Visibility[],
		},
	}

	if (searchQuery) searchFilter.$text = { $search: searchQuery }
	if (tags) {
		searchFilter.tags = {
			$all: tags,
		}
	}

	const foundEntries = await collection
		.find(searchFilter)
		.sort({ editedAt: -1 })
		.skip(skip)
		.limit(limit)
		.toArray()

	return foundEntries.map(replaceUuidWithId)
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
		{ $set: { ...entry, editedAt: new Date() } },
		{ returnDocument: 'after' }
	)

	return result.value ? replaceUuidWithId(result.value) : null
}

/**
 * Create an entry
 */
export async function createEntry(
	entry: Omit<Entry, 'id' | 'createdAt' | 'editedAt'>
): Promise<Entry | null> {
	const collection = await getCollection()
	const entryId = createUuid()

	// add the id to the entry
	const newEntry: ReplaceIdWithUuid<Entry> = {
		...entry,
		_id: entryId,
		createdAt: new Date(),
		editedAt: new Date(),
	}

	// insert the entry into the database
	await collection.insertOne(newEntry)

	return replaceUuidWithId(newEntry)
}

export async function countEntries(options?: FilterEntriesOptions): Promise<number> {
	const collection = await getCollection()
	const count = await collection.countDocuments({
		visibility: {
			$in: [
				options?.visible ?? true ? 'visible' : undefined,
				options?.unlisted ?? false ? 'unlisted' : undefined,
				options?.hidden ?? false ? 'hidden' : undefined,
			].filter(Boolean) as Visibility[],
		},
	})
	return count
}
