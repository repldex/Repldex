import type { GetSession, Handle } from '@sveltejs/kit'
import cookie from 'cookie'
import { generateToken } from '../lib/auth'
import { fetchUser } from '../lib/database/users'

export const handle: Handle = async ({ request, resolve }) => {
	const cookies = cookie.parse(request.headers.cookie ?? '')

	// console.log('cookies:', cookies)
	/*request.locals.user = cookies.sid
		? await fetchUser({
				id: cookies.sid,
		  })
		: undefined*/

	return await resolve(request)
}

export const getSession: GetSession = ({ locals }) => {
	return {
		//user: locals.user,
	}
}
