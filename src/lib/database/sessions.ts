import { createUuid, getDatabase, ReplaceIdWithUuid, replaceIdWithUuid, replaceUuidWithId } from '.'
import type { Binary, Collection } from 'mongodb'
import { generateToken } from '../auth'
import { fetchUser } from './users'

// each session is linked to one user, but each user can have multiple sessions
interface Session {
	/** The id of the session */
	id: string
	/** The Repldex user id of the Repldex user */
	userId: Binary
}

// async function getCollection(): Promise<Collection<ReplaceIdWithUuid<Session>>> {
// 	const db = await getDatabase()
// 	return db.collection('sessions')
// }

// export async function fetchSession(id: string): Promise<Session | null> {
// const collection = await getCollection()
// const session = await collection.findOne(replaceIdWithUuid({ id }))
// return session ? replaceUuidWithId(session) : null
// }

/** Create a user session and return the id of the created session */
export async function createSession(data: Omit<Session, 'id'>): Promise<string> {
	// const collection = await getCollection()
	const user = await fetchUser({
		id: data.userId.toString('hex'),
	})
	if (!user) throw new Error('Cannot create session for user that does not exist')

	const sessionId = generateToken({
		username: user.username,
		id: user.id,
	})

	// await collection.insertOne({
	// 	...replaceIdWithUuid(data),
	// 	_id: sessionId,
	// })
	return sessionId
}