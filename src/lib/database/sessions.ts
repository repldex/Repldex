import { createUuid, getDatabase, ReplaceIdWithUuid, replaceIdWithUuid, replaceUuidWithId } from '.'
import type { Binary, Collection } from 'mongodb'
import { generateToken } from '../auth'

// each session is linked to one user, but each user can have multiple sessions
interface Session {
	/** The id of the session */
	id: string
	/** The Repldex user id of the Repldex user */
	userId: Binary
}

async function getCollection(): Promise<Collection<ReplaceIdWithUuid<Session>>> {
	const db = await getDatabase()
	return db.collection('sessions')
}

export async function fetchSession(id: string): Promise<Session | null> {
	const collection = await getCollection()
	const session = await collection.findOne(replaceIdWithUuid({ id }))
	return session ? replaceUuidWithId(session) : null
}

/** Create a user session and return the id of the created session */
export async function createSession(data: Omit<Session, 'id'>): Promise<string> {
	const collection = await getCollection()
	const sessionId = generateToken()
	await collection.insertOne({
		...replaceIdWithUuid(data),
		_id: sessionId,
	})
	return sessionId.toString('hex')
}
