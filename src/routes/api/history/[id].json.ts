import type { RequestHandler } from '@sveltejs/kit'
import type { JSONString } from '@sveltejs/kit/types/helper'
import { fetchEntryHistory } from '../../../lib/database/history'
import { createUuid } from '../../../lib/database'

export interface APIHistoryItem {
	id: string
	entryId: string
	userId: string
	title: string
	content: string
	timestamp: Date
}

// gets the history of an entry
export const get: RequestHandler = async req => {
	const history = await fetchEntryHistory(
		createUuid(req.params.id),
		parseInt(req.url.searchParams.get('limit') ?? '20'),
		parseInt(req.url.searchParams.get('page') ?? '0')
	)
	return {
		body: history.map((h): APIHistoryItem => ({
			id: h.id,
			entryId: h.entryId.toString('hex'),
			userId: h.userId.toString('hex'),
			title: h.title,
			content: h.content,
			timestamp: h.timestamp,
		})) as unknown as JSONString,
	}
}
