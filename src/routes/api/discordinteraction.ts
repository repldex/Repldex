import { verifyInteraction, handleInteraction } from '../../lib/discord/api/interactions'
import type { RequestHandler } from '@sveltejs/kit'

export const post: RequestHandler = async req => {
	const isValidRequest = verifyInteraction(req.headers, req.rawBody ?? '')
	if (!isValidRequest)
		return {
			status: 401,
			body: 'Invalid request',
		}

	// we do `as any` for `handleInteraction` since we know for certain req.body is always an object
	const interactionResponse = await handleInteraction(req.body as any)
	// ... and here because the typings for `RequestHandler` are wrong
	return {
		body: interactionResponse as any,
		status: 200,
	}
}
