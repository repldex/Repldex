import type { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '.'


interface LinkedAccounts {
	// linked accounts are always ids
	discord?: string
}

interface User {
	_id: ObjectId
	username: string
	accounts?: LinkedAccounts
}

type FetchUserQuery = Partial<Omit<User, '_id'> | { id: string }>

async function getCollection(): Promise<Collection<User>> {
	const db = await getDatabase()
	return db.collection('users')
}

/** Fetch a user by any of their attributes */
export async function fetchUser(data: FetchUserQuery): Promise<User | null> {
	const collection = await getCollection()

	if ('id' in data) {
		data._id = new ObjectId(data.id)
		delete data.id
	}

	return await collection.findOne(data)
}

/** Create a Repldex user and return their Repldex user id */
export async function createUser(data: Omit<User, '_id'>): string {
	const collection = await getCollection()
	const insertedResponse = await collection.insertOne(data)
	return insertedResponse.insertedId.toString()
}
