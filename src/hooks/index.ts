import { authenticateToken, generateToken } from '../lib/auth'
import type { GetSession, Handle } from '@sveltejs/kit'
import { fetchUser } from '../lib/database/users'
import cookie from 'cookie'

export const handle: Handle = async ({ request, resolve }) => {
	const cookies = cookie.parse(request.headers.cookie ?? '')

	try {
		request.locals.user = await authenticateToken(cookies.sid)
	} catch (error) {
		request.locals.user = null
	}

	return await resolve(request)
}

export const getSession: GetSession = ({ locals }) => {
	return {
		user: locals.user,
	}
}
