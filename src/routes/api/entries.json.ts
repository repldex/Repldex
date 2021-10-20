import { fetchEntries } from '$lib/database.ts'
import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = async req => {
	return {
		body: await fetchEntries(),
	}
}
