import { fetchEntry } from '../../../lib/database/entries'
import type { RequestHandler } from '@sveltejs/kit'
import type { JSONString } from '@sveltejs/kit/types/helper'

export const get: RequestHandler = async req => {
	const entry = await fetchEntry(req.params.slug)
	return {
		body: entry as unknown as JSONString,
	}
}
