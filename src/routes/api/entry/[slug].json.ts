import { canCreateEntries, isAdmin, canEditEntry } from '../../../lib/perms'
import { editEntry, fetchEntry, Visibility } from '../../../lib/database/entries'
import { createHistoryItem } from '../../../lib/database/history'
import { createSlug, createUuid } from '../../../lib/database'
import type { JSONValue } from '@sveltejs/kit/types/helper'
import { fetchUser } from '../../../lib/database/users'
import type { RequestHandler } from '@sveltejs/kit'
import '../../../lib/revert'

// get an entry
export const get: RequestHandler = async req => {
	const entry = await fetchEntry(req.params.slug)
	return {
		body: entry as JSONValue,
	}
}

// edit an existing entry
export const put: RequestHandler = async req => {
	const body = (await req.request.json()) as any
	const content = (body.content as string) ?? null
	const title = (body.title as string) ?? null
	const entryId = (body.id as string) ?? null
	const visibility = (body.visibility as Visibility) ?? null

	const basicUser = req.locals.user

	if (!basicUser) {
		return {
			status: 400,
			body: { error: 'You must be logged in to edit an entry.' },
		}
	}

	console.log('visibility', visibility)

	if (
		!body ||
		typeof body !== 'object' ||
		body instanceof Uint8Array ||
		// make sure the content/title/id exist and aren't empty
		!content ||
		!title ||
		!entryId ||
		!visibility ||
		!['visible', 'unlisted', 'private'].includes(visibility)
	)
		return {
			status: 400,
			body: { error: 'Invalid request body' },
		}

	// fetch the user and entry at the same time
	const userPromise = fetchUser({ id: basicUser.id })
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
	const isAdminPromise = isAdmin(user)

	console.log('user', user, user.id)

	// if the user can't edit entries, return a 403
	if (!(await canEditEntry(user, entry)))
		return {
			status: 403,
			body: { error: 'You do not have permission to edit this entry' },
		}

	// if the title is different, check if they can create entries
	if (title !== entry.title && !(await canCreateEntriesPromise))
		return {
			status: 403,
			body: { error: 'You do not have permission to rename this entry' },
		}

	const slug = createSlug(title)

	// if the visibility is different, check if they can delete entries
	if (body.visibility !== entry.visibility && !(await isAdminPromise))
		return {
			status: 403,
			body: { error: 'You do not have permission to change the visibility of this entry' },
		}

	// everything is right, do the edit and add to the history
	const editedEntry = await editEntry(entry.id, {
		content,
		slug,
		title,
		visibility,
	})
	await createHistoryItem({
		entryId: createUuid(entry.id),
		content,
		title,
		timestamp: new Date(),
		userId: createUuid(user.id),
		visibility,
	})

	return {
		body: editedEntry as any,
	}
}
