// https://discordapp.com/oauth2/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code&scope=identify

import type { RequestHandler } from '@sveltejs/kit'

const clientSecret = process.env['DISCORD_CLIENT_SECRET']
if (!clientSecret) throw new Error('DISCORD_CLIENT_SECRET environment variable not set')

export const get: RequestHandler = async _req => {
	return {
		status: 302,
		headers: {
			'set-cookie': `sid=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
			'location': '/',
		},
	}
}
