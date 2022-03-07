import type { Entry } from './database/entries'
import type { User } from './database/users'

// Only mat can create/edit entries for now. This will be changed to check the
// database once moderation (anti vandalism, banning, etc) is added.

/**
 * Whether the user can create (or rename) entries. Renaming is included here
 * since it often has the same effect as creating a new entry.
 */
export async function canCreateEntries(user: User): Promise<boolean> {
	return user.id === '719b795e705340bd82596d6cfcfa4224'
}

export async function canEditEntry(user: User, entry: Entry): Promise<boolean> {
	return user.id === '719b795e705340bd82596d6cfcfa4224'
}

/**
 * Whether the user has permission to delete entries. Only admins can delete entries.
 */
export async function canDeleteEntries(user: User, entry: Entry): Promise<boolean> {
	return user.id === '719b795e705340bd82596d6cfcfa4224'
}
