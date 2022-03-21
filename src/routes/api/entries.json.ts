import { createEntry, fetchEntries, fetchEntry, Visibility } from '../../lib/database/entries'
import { createSlug, createUuid } from '../../lib/database/index'
import { createHistoryItem } from '../../lib/database/history'
import type { JSONValue } from '@sveltejs/kit/types/helper'
import { fetchUser } from '../../lib/database/users'
import type { RequestHandler } from '@sveltejs/kit'
import { canCreateEntries, isAdmin } from '../../lib/perms'

export const get: RequestHandler = async req => {
	const showVisible = req.url.searchParams.get('visible') !== 'false'
	const showUnlisted = req.url.searchParams.get('unlisted') === 'true'
	const showHidden = req.url.searchParams.get('hidden') === 'true'
	const tags = req.url.searchParams.get('tags')?.split(',')
	const query = req.url.searchParams.get('query')

	const user = req.locals.user ? await fetchUser({ id: req.locals.user.id }) : null

	const canViewUnlisted = user ? true : false
	const canViewHidden = user ? await isAdmin(user) : false

	if (showUnlisted && !canViewUnlisted) {
		return { status: 403, body: { error: 'You do not have permission to view unlisted entries' } }
	}
	if (showHidden && !canViewHidden) {
		return { status: 403, body: { error: 'You do not have permission to view hidden entries' } }
	}

	const entries = await fetchEntries({
		limit: parseInt(req.url.searchParams.get('limit') ?? '20'),
		skip: parseInt(req.url.searchParams.get('skip') ?? '0'),
		visible: showVisible,
		unlisted: showUnlisted,
		hidden: showHidden,
		tags: tags,
		query: query ? query : undefined,
	})

	return {
		// we have to do this because sveltekit's types are kinda bad :(
		body: entries as unknown as JSONValue,
	}
}

// create a new entry
export const post: RequestHandler = async req => {
	if (!req.locals.user)
		return {
			status: 401,
			body: {
				error: 'Not logged in',
			},
		}

	const body = await req.request.json()

	const user = await fetchUser({ id: req.locals.user.id })
	// if the user can't create entries, return a 403
	if (!(user && canCreateEntries(user)))
		return {
			status: 403,
			body: { error: 'You do not have permission to create entries' },
		}

	if (!body)
		return {
			status: 400,
			body: { error: 'Invalid request body' },
		}

	// the typings for req.body are wrong, so we have to do `as any`
	const entryContent = body.content
	const entryTitle = body.title

	const slug = createSlug(entryTitle)

	const existingEntry = await fetchEntry(slug)

	// if the entry already exists, return a 409
	if (existingEntry)
		return {
			status: 409,
			body: { error: 'An entry with that title already exists' },
		}

	// if the entry doesn't have a title or content, return a 400
	if (
		!entryTitle ||
		!entryContent ||
		typeof entryTitle !== 'string' ||
		typeof entryContent !== 'string' ||
		(body.visibility && !['visible', 'unlisted', 'hidden'].includes(body.visibility))
	)
		return {
			status: 400,
			body: { error: 'Invalid request body' },
		}

	const visibility: Visibility = body.visibility ?? 'unlisted'

	if (visibility !== 'unlisted' && !isAdmin(user))
		return {
			status: 403,
			body: { error: 'You do not have permission to set the visibility of this entry' },
		}

	// create the entry
	const entry = await createEntry({
		content: entryContent,
		title: entryTitle,
		slug,
		visibility,
		tags: [],
	})

	if (entry) {
		await createHistoryItem({
			entryId: createUuid(entry.id),
			content: entryContent,
			title: entryTitle,
			timestamp: entry.createdAt,
			userId: createUuid(user.id),
			visibility,
		})
	}

	return {
		body: entry as any,
	}
}
