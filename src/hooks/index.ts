import type { GetSession, Handle } from '@sveltejs/kit'
import cookie from 'cookie'

export const handle: Handle = async ({ request, resolve }) => {
	const cookies = cookie.parse(request.headers.cookie || '')
	// const jwt = cookies.jwt && Buffer.from(cookies.jwt, 'base64').toString('utf-8')
	// request.locals.user = jwt ? JSON.parse(jwt) : null
	return await resolve(request)
}

export const getSession: GetSession = ({ locals }) => {
	return {
		user: locals.user,
	}
}
