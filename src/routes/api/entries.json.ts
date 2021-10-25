import { fetchEntries } from '$lib/database/entries'
import type { RequestHandler } from '@sveltejs/kit'
import type { JSONString } from '@sveltejs/kit/types/helper'

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
