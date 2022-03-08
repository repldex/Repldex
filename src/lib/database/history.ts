import type { Binary, Collection } from 'mongodb'
import {
	createUuid,
	getOrCreateCollection,
	replaceIdWithUuid,
	ReplaceIdWithUuid,
	replaceUuidWithId,
} from '.'
import type { Visibility } from './entries'

export interface HistoryItem {
	id: string
	entryId: Binary
	userId: Binary
	title: string
	content: string
	timestamp: Date
	visibility: Visibility
	reverted?: boolean
}

async function getCollection(): Promise<Collection<ReplaceIdWithUuid<HistoryItem>>> {
	return await getOrCreateCollection(
		'history',
		{
			storageEngine: { wiredTiger: { configString: 'blockCompressor=zlib' } },
		},
		[
			{ key: { entryId: 1 }, name: 'entryId' },
			{ key: { timestamp: -1 }, name: 'timestamp' },
		]
	)
}

export async function createHistoryItem(entry: Omit<HistoryItem, 'id'>): Promise<string> {
	const collection = await getCollection()
	const historyEntryId = createUuid()
	await collection.insertOne({
		...entry,
		_id: historyEntryId,
	})
	return historyEntryId.toString('hex')
}

/**
 * Get the history of an entry
 * @param entryId The id of the entry
 * @param limit The maximum number of history items to return
 * @param page The page, starting at 0
 */
export async function fetchEntryHistory(
	entryId: Binary,
	limit: number,
	page: number
): Promise<{ count: number; items: HistoryItem[] }> {
	const collection = await getCollection()

	// get the items and count at the same time
	const historyPromise = collection
		.find({ entryId })
		.sort({ timestamp: -1 })
		.skip(page * limit)
		.limit(limit)
		.toArray()
	const historyItemCount = await collection.count({ entryId })
	const history = await historyPromise

	return {
		count: historyItemCount,
		items: history.map(replaceUuidWithId),
	}
}

/**
 * Get the entire history items of an entry that occured after a certain edit.
 * The item won't be included in the results.
 * @param item The history item
 */
export async function fetchEntryHistoryItemsAfter(item: HistoryItem): Promise<HistoryItem[]> {
	const collection = await getCollection()

	// get the items and count at the same time
	const history = await collection
		.find({ entryId: item.entryId, timestamp: { $gt: item.timestamp } })
		.sort({ timestamp: -1 })
		.toArray()

	return history.map(replaceUuidWithId)
}

/**
 * Get the history item that was made right before this one, so we can calculate the diff
 */
export async function fetchEntryHistoryItemBefore(item: HistoryItem): Promise<HistoryItem | null> {
	const collection = await getCollection()

	const result = await collection
		.find({ entryId: item.entryId, timestamp: { $lt: item.timestamp } })
		.sort({ timestamp: -1 })
		.limit(1)
		.toArray()

	if (result.length === 0) return null
	return replaceUuidWithId(result[0])
}

/**
 * Get the history item that was made right before this one, so we can calculate the diff
 */
export async function fetchEntryHistoryItem(id: string): Promise<HistoryItem | null> {
	const collection = await getCollection()

	const result = await collection.findOne(replaceIdWithUuid({ id }))

	if (result === null) return null
	return replaceUuidWithId(result)
}

export async function updateHistoryItem(
	itemId: string,
	entry: Partial<Omit<HistoryItem, 'id'>>
): Promise<void> {
	const collection = await getCollection()

	await collection.findOneAndUpdate(
		{ _id: createUuid(itemId) },
		{ $set: entry },
		{ returnDocument: 'after' }
	)
}
