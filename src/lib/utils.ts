import type { APIUser } from './database/users'

const ongoingFetchUserRequests: Record<string, Promise<any>> = {}
const cachedAPIUsers: Record<string, APIUser> = {}

/** Fetch a user, making sure that we don't duplicate requests */
export async function fetchUser(userId: string): Promise<APIUser | null> {
	if (userId in cachedAPIUsers) return cachedAPIUsers[userId]
	if (userId in ongoingFetchUserRequests) return await ongoingFetchUserRequests[userId]

	ongoingFetchUserRequests[userId] = new Promise(resolve => {
		// wait until the user id is in cachedAPIUsers
		const interval = setInterval(() => {
			if (!(userId in ongoingFetchUserRequests)) {
				clearInterval(interval)
				resolve(cachedAPIUsers[userId])
			}
		}, 50)
	})

	const r = await fetch(`/api/user/${userId}.json`)
	const user: APIUser = await r.json()

	delete ongoingFetchUserRequests[userId]
	cachedAPIUsers[userId] = user

	return user
}
