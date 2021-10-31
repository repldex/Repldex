import type { Binary, Collection } from 'mongodb'
import { createUuid, getDatabase, replaceIdWithUuid, ReplaceIdWithUuid, replaceUuidWithId } from '.'

export interface HistoryItem {
	id: string
	entryId: Binary
	userId: Binary
	title: string
	content: string
	timestamp: Date
}

let hasTriedCreatingCollection = false

async function getCollection(): Promise<Collection<ReplaceIdWithUuid<HistoryItem>>> {
	const db = await getDatabase()

	// we explicitly create the collection instead of letting mongodb do it so we can set the compression level and indexes
	if (!hasTriedCreatingCollection) {
		hasTriedCreatingCollection = true
		try {
			// try creating the collection with zlib first
			const coll = await db.createCollection('history', {
				storageEngine: {
					wiredTiger: { configString: 'blockCompressor=zlib' },
				},
			})
			await coll.createIndexes([
				{ key: { entryId: 1 }, name: 'entryId' },
				{ key: { timestamp: -1 }, name: 'timestamp' },
			])
		} catch {
			// ignore
		}
	}
	return db.collection('history')
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
