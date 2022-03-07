import { authenticateToken } from '../lib/auth'
import type { GetSession, Handle } from '@sveltejs/kit'
import type { BasicUser } from '../lib/database/users'
import cookie from 'cookie'

export const handle: Handle = async ({ event, resolve }) => {
	const cookies = cookie.parse(event.request.headers.get('cookie') ?? '')

	try {
		// Get the data from the token
		const payloadResponse = await authenticateToken(cookies.sid)
		if (!payloadResponse.id || !payloadResponse.username) throw new Error('Invalid token')
		event.locals.user = payloadResponse as BasicUser
	} catch (error) {
		event.locals.user = null
	}

	return await resolve(event)
}

export const getSession: GetSession = ({ locals }) => {
	return {
		user: locals.user,
	}
}
