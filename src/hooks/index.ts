import { authenticateToken, generateToken } from '../lib/auth'
import type { GetSession, Handle } from '@sveltejs/kit'
import { fetchUser } from '../lib/database/users'
import cookie from 'cookie'

export const handle: Handle = async ({ event, resolve }) => {
	const cookies = cookie.parse(event.request.headers.get('cookie') ?? '')

	try {
		event.locals.user = await authenticateToken(cookies.sid)
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
