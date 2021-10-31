import { createEntry, fetchEntries, fetchEntry } from '../../lib/database/entries'
import type { RequestHandler } from '@sveltejs/kit'
import type { JSONString } from '@sveltejs/kit/types/helper'
import { canCreateEntries } from '../../lib/perms'
import { fetchUser } from '../../lib/database/users'
import { createSlug, createUuid } from '../../lib/database/index'
import { createHistoryItem } from '../../lib/database/history'

export const get: RequestHandler = async req => {
	const entries = await fetchEntries({
		limit: parseInt(req.query.get('limit') ?? '20'),
		skip: parseInt(req.query.get('skip') ?? '0'),
	})

	return {
		// we have to do this because sveltekit's types are kinda bad :(
		body: entries as unknown as JSONString,
	}
}

// create a new entry, does the same thing as put
export const post: RequestHandler = async req => {
	const user = await fetchUser({ id: req.locals.user.id })
	// if the user can't create entries, return a 403
	if (!(user && (await canCreateEntries(user))))
		return {
			status: 403,
			body: { error: 'You do not have permission to create entries' },
		}

	if (!req.body || typeof req.body !== 'object' || req.body instanceof Uint8Array)
		return {
			status: 400,
			body: { error: 'Invalid request body' },
		}

	// the typings for req.body are wrong, so we have to do `as any`
	const entryContent = (req.body as any).content
	const entryTitle = (req.body as any).title

	const slug = createSlug(entryTitle)

	const existingEntry = await fetchEntry(slug)

	// if the entry already exists, return a 409
	if (existingEntry)
		return {
			status: 409,
			body: { error: 'An entry with that title already exists' },
		}

	// if the entry doesn't have a title or content, return a 400
	if (!entryTitle || !entryContent)
		return {
			status: 400,
			body: { error: 'Invalid request body' },
		}

	// create the entry
	const entry = await createEntry({
		content: entryContent,
		title: entryTitle,
		slug,
	})
	if (entry) {
		await createHistoryItem({
			entryId: createUuid(entry.id),
			content: entryContent,
			title: entryTitle,
			timestamp: entry.createdAt,
			userId: createUuid(user.id),
		})
	}

	return {
		body: entry as any,
	}
}
