import { editEntry, fetchEntry } from '../../../lib/database/entries'
import type { RequestHandler } from '@sveltejs/kit'
import type { JSONString } from '@sveltejs/kit/types/helper'
import { fetchUser } from '../../../lib/database/users'
import { canCreateEntries, canEditEntry } from '../../../lib/perms'
import { createSlug, createUuid } from '../../../lib/database'
import { createHistoryItem } from '../../../lib/database/history'

// get an entry
export const get: RequestHandler = async req => {
	const entry = await fetchEntry(req.params.slug)
	return {
		body: entry as unknown as JSONString,
	}
}

// edit an existing entry
export const put: RequestHandler = async req => {
	const body = req.body as any
	const content = body.content as string | null
	const title = body.title as string | null
	const entryId = body.id as string | null

	if (
		!body ||
		typeof body !== 'object' ||
		body instanceof Uint8Array ||
		// make sure the content/title/id exist and aren't empty
		!content ||
		!title ||
		!entryId
	)
		return {
			status: 400,
			body: { error: 'Invalid request body' },
		}

	// fetch the user and entry at the same time
	const userPromise = fetchUser({ id: req.locals.user.id })
	const entry = await fetchEntry(entryId)

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

	const canCreateEntriesPromise = canCreateEntries(user)

	console.log('user', user, user.id)

	// if the user can't edit entries, return a 403
	if (!(await canEditEntry(user, entry)))
		return {
			status: 403,
			body: { error: 'You do not have permission to edit this entry' },
		}

	// if the title is different, check if they can create entries
	if (!(await canCreateEntriesPromise))
		return {
			status: 403,
			body: { error: 'You do not have permission to rename this entry' },
		}

	const slug = createSlug(title)

	// everything is right, do the edit and add to the history
	const editedEntry = await editEntry(entry.id, {
		content,
		slug,
		title,
	})
	await createHistoryItem({
		entryId: createUuid(entry.id),
		content,
		title,
		timestamp: new Date(),
		userId: createUuid(user.id),
	})

	return {
		body: editedEntry as any,
	}
}
