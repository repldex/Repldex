import type { Collection } from 'mongodb'
import { ObjectId } from 'mongodb'
import { getDatabase } from '.'

interface LinkedAccounts {
	// linked accounts are always as ids
	discord?: string
}

interface User {
	/** The unique ID of the user. This never changes. */
	_id: ObjectId
	/** The username of the Repldex user. This should not be relied on to be unique or to stay the same, use the id for that. */
	username: string
	accounts?: LinkedAccounts
}

type Join<K, P> = K extends string | number
	? P extends string | number
		? `${K}${'' extends P ? '' : '.'}${P}`
		: never
	: never

type Prev = [never, 0, 1, 2, 3, 4, ...0[]]

type Leaves<T, D extends number = 5> = [D] extends [never]
	? never
	: T extends object
	? { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T]
	: ''

type FetchUserQuery = Partial<Leaves<Omit<User, '_id'> & { id: string }>>

async function getCollection(): Promise<Collection<User>> {
	const db = await getDatabase()
	return db.collection('users')
}

/** Fetch a user by any of their attributes */
export async function fetchUser(data: FetchUserQuery): Promise<User | null> {
	const collection = await getCollection()

	// replace "id" with "_id" and convert it to an ObjectId
	const fetchUserQuery = Object.fromEntries(
		Object.keys(data).map(k => (k === 'id' ? ['_id', new ObjectId(data[k])] : [k, data[k]]))
	) as Omit<FetchUserQuery, 'id'> & '_id'

	return await collection.findOne(fetchUserQuery)
}

/** Create a Repldex user and return their Repldex user id */
export async function createUser(data: Omit<User, '_id'>): Promise<string> {
	const collection = await getCollection()
	const insertedResponse = await collection.insertOne(data)
	return insertedResponse.insertedId.toString()
}
