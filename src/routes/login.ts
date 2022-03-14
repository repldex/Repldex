// https://discordapp.com/oauth2/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code&scope=identify

import { createUser, fetchUser } from '../lib/database/users'
import { createSession } from '../lib/database/sessions'
import type { RequestHandler } from '@sveltejs/kit'
import { createUuid } from '../lib/database/index'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
if (!DISCORD_CLIENT_ID) throw new Error('DISCORD_CLIENT_ID environment variable not set')

const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
if (!DISCORD_CLIENT_SECRET) throw new Error('DISCORD_CLIENT_SECRET environment variable not set')

export const get: RequestHandler = async req => {
	const discordOauthCode = req.url.searchParams.get('code')
	const redirectUri = new URL('/login', `https://${req.url.host}`).toString()

	// if there's no OAuth code, redirect to Discord's authorization page

	if (!discordOauthCode) {
		return {
			// redirect to discord login
			status: 302,
			headers: {
				location: `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=identify`,
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
			client_id: DISCORD_CLIENT_ID,
			client_secret: DISCORD_CLIENT_SECRET,
			grant_type: 'authorization_code',
			code: discordOauthCode,
			redirect_uri: redirectUri,
		}).toString(),
	}).then(res => res.json())

	// use the user's discord access token to get their discord id
	const accessToken = discordOauthTokenData.access_token

	const discordUserData = await fetch('https://discord.com/api/users/@me', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	}).then(res => res.json())

	if (!discordUserData.id) {
		console.log(discordUserData)
		throw new Error('Failed to get user data from Discord')
	}

	// get the existing data for the user, if they don't exist this will be null
	const existingRepldexUser = await fetchUser({
		accounts: {
			discord: discordUserData.id,
		},
	})

	let sessionId: string
	if (existingRepldexUser) {
		// the user has a repldex account, create a new session for them
		sessionId = await createSession({
			userId: createUuid(existingRepldexUser.id),
		})
	} else {
		// the user does not have a repldex account, create one for them and then create a session for them
		const repldexUserId = await createUser({
			username: discordUserData.username,
			accounts: {
				discord: discordUserData.id,
			},
			admin: false,
		})
		sessionId = await createSession({
			userId: createUuid(repldexUserId),
		})
	}

	// expire the cookie after 90 days
	const cookieExpiresTimestamp = new Date(
		new Date().getTime() + 90 * 24 * 60 * 60 * 1000
	).toUTCString()

	return {
		status: 302,
		headers: {
			'set-cookie': `sid=${sessionId}; Path=/; HttpOnly; expires=${cookieExpiresTimestamp}`,
			'location': '/',
		},
	} as any // we have to convert to any here because of a bug in sveltekit :(
}
