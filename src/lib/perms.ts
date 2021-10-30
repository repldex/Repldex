import type { User } from './database/users'

export async function canCreateEntries(user: User) {
	// only allow mat to create entries for now, this will be changed once i add more stuff
	return user.id === '719b795e705340bd82596d6cfcfa4224'
}
