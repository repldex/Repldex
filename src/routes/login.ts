// https://discordapp.com/oauth2/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code&scope=identify

import type { RequestHandler } from '@sveltejs/kit'
import config from '$lib/config'

const clientSecret = process.env['DISCORD_CLIENT_SECRET']
if (!clientSecret) throw new Error('DISCORD_CLIENT_SECRET environment variable not set')

export const get: RequestHandler = async req => {
	const discordOauthCode = req.query.get('code')
	const redirectUri = new URL('/login', `https://${req.host}`).toString()

	// if there's no OAuth code, redirect to Discord's authorization page
	if (!discordOauthCode) {
		return {
			// redirect to discord login
			status: 302,
			headers: {
				location: `https://discord.com/oauth2/authorize?client_id=${config.client_id}&redirect_uri=${redirectUri}&response_type=code&scope=identify`,
			},
		}
	}

	// if there's an OAuth code, get the access token
	const discordOauthTokenData = await fetch('https://discord.com/api/oauth2/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			client_id: config.client_id,
			client_secret: clientSecret,
			grant_type: 'authorization_code',
			code: discordOauthCode,
			redirect_uri: redirectUri,
		}).toString(),
	}).then(res => res.json())

	console.log(discordOauthTokenData)
}
