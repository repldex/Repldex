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

interface UserStats {
	/** The total number of entries edited or created by this user */
	entriesEdited?: number
	/** The total nubmer of edits that this user made that were later reverted */
}

/** All of the information about the user in the database */
export interface User extends APIUser {
	accounts?: LinkedAccounts
	stats?: UserStats
}

type FetchUserQuery = Partial<Omit<User, '_id'> & { id: string }>

async function getCollection(): Promise<Collection<ReplaceIdWithUuid<User>>> {
	const db = await getDatabase()
	return db.collection('users')
}

let userCache: Record<string, User> = {}
/**
 * The ids of users that are currently being fetched. This is used to we don't
 * fetch the same user twice at the same time
 */
const usersBeingFetched = new Set<string>()

/** Fetch a user by any of their attributes */
export async function fetchUser(data: FetchUserQuery): Promise<User | null> {
	if (data.id) {
		const id = data.id
		if (userCache[id]) return userCache[id]

		if (usersBeingFetched.has(id)) {
			// wait for the user to be fetched
			return new Promise(resolve => {
				const interval = setInterval(() => {
					if (!usersBeingFetched.has(id)) {
						clearInterval(interval)
						resolve(userCache[id] ?? null)
					}
				}, 50)
			})
		}
		usersBeingFetched.add(id)
	}

	try {
		const collection = await getCollection()

		const fetchUserQuery = flattenMongoQuery(replaceIdWithUuid(data))
		const user = await collection.findOne(fetchUserQuery)

		const result = user ? replaceUuidWithId(user) : null

		// save the user's data in the cache
		if (result) {
			userCache[result.id] = result
			if (result.id) usersBeingFetched.delete(result.id)
		}

		return result
	} catch {
		if (data.id) usersBeingFetched.delete(data.id)
		return null
	}
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

function invalidateUserCache(userId: string) {
	delete userCache[userId]
}

/** Update the user's stats after they edited an entry */
export async function updateUserEntryEdited(userId: string): Promise<void> {
	const collection = await getCollection()
	invalidateUserCache(userId)

	await collection.updateOne(replaceIdWithUuid({ id: userId }), {
		$inc: {
			'stats.entriesEdited': 1,
		},
	})
}

// clear the cache every 5 minutes, so it doesn't grow too large
setInterval(() => {
	userCache = {}
}, 5 * 60 * 1000)