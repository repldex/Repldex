import { fetchEntries, countEntries } from '../../lib/database/entries'
import type { RequestHandler } from '@sveltejs/kit'
import type { JSONValue } from '@sveltejs/kit/types/helper'

// random entry
export const get: RequestHandler = async req => {
	const entries = await fetchEntries({
		limit: 1,
		skip: Math.floor(Math.random() * (await countEntries())),
	})
	const entry = entries[0]
	return {
		body: entry as unknown as JSONValue,
	}
}
