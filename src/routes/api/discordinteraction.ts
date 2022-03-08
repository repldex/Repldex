import { verifyInteraction, handleInteraction } from '../../lib/discord/api/interactions'
import type { RequestHandler } from '@sveltejs/kit'

export const post: RequestHandler = async e => {
	if (!e.request.body)
		return {
			status: 401,
			body: 'Invalid request',
		}

	const bodyBuffer = await e.request.arrayBuffer()

	const isValidRequest = bodyBuffer && verifyInteraction(e.request.headers, bodyBuffer)

	if (!isValidRequest)
		return {
			status: 401,
			body: 'Invalid request',
		}

	const interactionResponse = await handleInteraction(
		JSON.parse(new TextDecoder().decode(bodyBuffer))
	)
	// we do `as any` here because the typings for `RequestHandler` are wrong
	return {
		body: interactionResponse as any,
		status: 200,
	}
}
