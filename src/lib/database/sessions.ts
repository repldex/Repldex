import type { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '.'

// each session is linked to one user, but each user can have multiple sessions
interface Session {
	/** The id of the session */
	_id: ObjectId
	/** The Repldex user id of the Repldex user */
	userId: string
}

async function getCollection(): Promise<Collection<Session>> {
	const db = await getDatabase()
	return db.collection('sessions')
}

export async function fetchSession(id: string): Promise<Session | null> {
	const collection = await getCollection()
	return await collection.findOne({ _id: id })
}

/** Create a user session and return the id of the created session */
export async function createSession(data: Omit<Session, '_id'>): Promise<string> {
	const collection = await getCollection()
	const insertedResponse = await collection.insertOne(data)
	return insertedResponse.insertedId.toString()
}
