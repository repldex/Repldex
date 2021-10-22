// https://discordapp.com/oauth2/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code&scope=identify

import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = async req => {
	return {
		// we have to do this because sveltekit's types are kinda bad :(
		body: {},
	}
}
