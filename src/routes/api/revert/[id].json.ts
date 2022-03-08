import type { RequestHandler } from '@sveltejs/kit'
import { createSlug, createUuid } from '../../../lib/database'
import { editEntry, fetchEntry } from '../../../lib/database/entries'
import { fetchUser } from '../../../lib/database/users'
import { canEditEntry } from '../../../lib/perms'
import {
	createHistoryItem,
	fetchEntryHistoryItem,
	fetchEntryHistoryItemBefore,
	updateHistoryItem,
} from '../../../lib/database/history'
import { getRevertResult } from '../../../lib/revert'
import type { JSONValue } from '@sveltejs/kit/types/helper'

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

	if (!req.locals.user) {
		return {
			status: 401,
			body: {
				error: 'You must be logged in to revert an entry.',
			},
		}
	}

	const userPromise = fetchUser({ id: req.locals.user.id })
	const entry = await fetchEntry(historyItem.entryId.toString('hex'))
	const historyItemBeforePromise = fetchEntryHistoryItemBefore(historyItem)
	const historyItemBefore = await historyItemBeforePromise

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
	if (!canEditEntry(user, entry))
		return {
			status: 403,
			body: { error: 'You do not have permission to edit this entry' },
		}

	const newContent = await getRevertResult(historyItem)

	if (
		!newContent ||
		(newContent === entry.content &&
			(!historyItemBefore || historyItemBefore.title === entry.title))
	)
		return {
			status: 400,
			body: { error: 'Nothing to revert' },
		}

	const title = historyItemBefore ? historyItemBefore.title : entry.title

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
		visibility: entry.visibility,
	})

	await updateHistoryItem(historyItemId, {
		reverted: true,
	})

	return {
		body: editedEntry as unknown as JSONValue,
	}
}
