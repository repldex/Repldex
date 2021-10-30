import type { Collection } from 'mongodb'
import {
	createUuid,
	flattenMongoQuery,
	getDatabase,
	ReplaceIdWithUuid,
	replaceIdWithUuid,
	replaceUuidWithId,
} from '.'

// the id and username of a user
export interface BasicUser {
	/** The unique ID of the user. This never changes. */
	id: string
	/** The username of the Repldex user. This should not be relied on to be unique or to stay the same, use the id for that. */
	username: string
}

/** The information exposed about a user from the API */
// export interface APIUser extends BasicUser {}
export type APIUser = BasicUser

interface LinkedAccounts {
	// linked accounts are always as ids
	discord?: string
}

/** All of the information about the user in the database */
export interface User extends APIUser {
	accounts?: LinkedAccounts
}

type FetchUserQuery = Partial<Omit<User, '_id'> & { id: string }>

async function getCollection(): Promise<Collection<ReplaceIdWithUuid<User>>> {
	const db = await getDatabase()
	return db.collection('users')
}

/** Fetch a user by any of their attributes */
export async function fetchUser(data: FetchUserQuery): Promise<User | null> {
	const collection = await getCollection()

	const fetchUserQuery = flattenMongoQuery(replaceIdWithUuid(data))
	const user = await collection.findOne(fetchUserQuery)
	return user ? replaceUuidWithId(user) : null
}

/** Create a Repldex user and return their Repldex user id */
export async function createUser(data: Omit<User, 'id'>): Promise<string> {
	const collection = await getCollection()
	const userId = createUuid()
	await collection.insertOne({
		...data,
		_id: userId,
	})
	return userId.toString('hex')
}
