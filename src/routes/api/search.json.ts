import { fetchEntries } from '../../lib/database/entries'
import type { RequestHandler } from '@sveltejs/kit'
import type { JSONValue } from '@sveltejs/kit/types/helper'

// returns all matching entries
export const get: RequestHandler = async req => {
	const query = req.url.searchParams.get('query')
	if (!query) return { body: 'No query' }
	const entries = await fetchEntries({
		limit: parseInt(req.url.searchParams.get('limit') ?? '20'),
		skip: parseInt(req.url.searchParams.get('skip') ?? '0'),
		query: query,
	})

	return {
		body: entries as unknown as JSONValue,
	}
}
