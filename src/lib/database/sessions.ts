import type { Collection } from 'mongodb'
import { getDatabase } from '.'

// each session is linked to one user, but each user can have multiple sessions
interface Session {
	id: string
	userId: string
}

async function getCollection(): Promise<Collection<Session>> {
	const db = await getDatabase()
	return db.collection('sessions')
}

export async function fetchSession(id: string): Promise<Session | null> {
	const collection = await getCollection()
	return collection.findOne({ id })
}
