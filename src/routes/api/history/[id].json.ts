import type { RequestHandler } from '@sveltejs/kit'
import type { JSONValue } from '@sveltejs/kit/types/helper'
import { fetchEntryHistory } from '../../../lib/database/history'
import { createUuid } from '../../../lib/database'
import { fetchEntry, Visibility } from '../../../lib/database/entries'
import { fetchUser } from '../../../lib/database/users'
import { canSeeEntry } from '../../../lib/perms'

export interface APIHistoryItem {
	id: string
	entryId: string
	userId: string
	title: string
	content: string
	timestamp: Date
	visibility: Visibility
	reverted?: boolean
}

export interface APIHistoryResponse {
	count: number
	items: APIHistoryItem[]
}

// gets the history of an entry
export const get: RequestHandler = async req => {
	const entryId = req.params.id

	// fetch the entry and history at the same time so it's faster
	const entryPromise = fetchEntry(entryId)

	const history = await fetchEntryHistory(
		createUuid(entryId),
		parseInt(req.url.searchParams.get('limit') ?? '20'),
		parseInt(req.url.searchParams.get('page') ?? '0')
	)
	const entry = await entryPromise

	if (!entry) {
		return {
			status: 404,
			body: { error: 'Entry not found' },
		}
	}

	// if it's hidden, make sure we're allowed to see it
	if (entry.visibility === 'hidden') {
		const user = req.locals.user ? await fetchUser({ id: req.locals.user.id }) : null
		if (!user) return { body: null }
		if (!canSeeEntry(user, entry)) return { body: null }
	}

	return {
		body: {
			count: history.count,
			items: history.items.map(
				(h): APIHistoryItem => ({
					id: h.id,
					entryId: h.entryId.toString('hex'),
					userId: h.userId.toString('hex'),
					title: h.title,
					content: h.content,
					timestamp: h.timestamp,
					visibility: h.visibility,
					reverted: h.reverted,
				})
			),
		} as unknown as JSONValue,
	}
}
