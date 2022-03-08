import type { Binary } from 'mongodb'
import { generateToken } from '../auth'
import { fetchUser } from './users'

// TODO: move sessions out of database

// each session is linked to one user, but each user can have multiple sessions
interface Session {
	/** The id of the session */
	id: string
	/** The Repldex user id of the Repldex user */
	userId: Binary
}

/** Create a user session and return the id of the created session */
export async function createSession(data: Omit<Session, 'id'>): Promise<string> {
	const user = await fetchUser({
		id: data.userId.toString('hex'),
	})
	if (!user) throw new Error('Cannot create session for user that does not exist')

	const sessionId = generateToken({
		username: user.username,
		id: user.id,
	})

	return sessionId
}
