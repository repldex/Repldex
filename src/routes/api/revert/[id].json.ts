import type { RequestHandler } from '@sveltejs/kit'
import type { JSONString } from '@sveltejs/kit/types/helper'
import { createSlug, createUuid } from '../../../lib/database'
import { editEntry, fetchEntry } from '../../../lib/database/entries'
import { fetchUser } from '../../../lib/database/users'
import { canCreateEntries, canEditEntry } from '../../../lib/perms'
import { createHistoryItem, fetchEntryHistoryItem } from '../../../lib/database/history'
import { getRevertResult } from '../../../lib/revert'

export interface APIHistoryItem {
	id: string
	entryId: string
	userId: string
	title: string
	content: string
	timestamp: Date
}

export interface APIHistoryResponse {
	count: number
	items: APIHistoryItem[]
}

// revert an entry history item
export const post: RequestHandler = async req => {
	const historyItemId = req.params.id

	const historyItem = await fetchEntryHistoryItem(historyItemId)

	if (historyItem === null)
		return {
			status: 404,
			body: {
				error: 'Not found',
			},
		}

	const userPromise = fetchUser({ id: req.locals.user.id })
	const entry = await fetchEntry(historyItem.entryId.toString('hex'))

	if (!entry)
		return {
			status: 404,
			body: { error: 'Not found' },
		}

	const user = await userPromise

	// if the user isn't logged in, return a 403
	if (!user)
		return {
			status: 403,
			body: { error: 'You must be logged in to edit entries' },
		}

	// if the user can't edit entries, return a 403
	if (!(await canEditEntry(user, entry)))
		return {
			status: 403,
			body: { error: 'You do not have permission to edit this entry' },
		}

	const newContent = await getRevertResult(historyItem)

	if (!newContent || newContent === entry.content)
		return {
			status: 400,
			body: { error: 'Nothing to revert' },
		}

	// TODO: this should use the title of the previous history item
	const title = entry.title

	const slug = createSlug(title)

	// everything is right, do the edit and add to the history
	const editedEntry = await editEntry(entry.id, {
		content: newContent,
		slug,
		title,
	})

	await createHistoryItem({
		entryId: createUuid(entry.id),
		content: newContent,
		title,
		timestamp: new Date(),
		userId: createUuid(user.id),
	})

	return {
		body: {
			content: newContent,
			title,
		} as unknown as JSONString,
	}
}
