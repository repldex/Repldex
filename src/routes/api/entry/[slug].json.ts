import { fetchEntry } from '$lib/database.ts'
import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = async req => {
	return {
		body: await fetchEntry(req.params.slug),
	}
}
