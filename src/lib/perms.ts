import type { Entry } from './database/entries'
import type { User } from './database/users'

// Only mat can create/edit entries for now. This will be changed to check the
// database once moderation (anti vandalism, banning, etc) is added.

/**
 * Whether the user can create (or rename) entries. Renaming is included here
 * since it often has the same effect as creating a new entry.
 */
export function canCreateEntries(user: User): boolean {
	return true
	//return user.id === '719b795e705340bd82596d6cfcfa4224'
}

export function canSeeEntry(user: User, entry: Entry): boolean {
	// admins can see all entries
	if (isAdmin(user)) return true
	return entry.visibility !== 'hidden'
}

export function canEditEntry(user: User, entry: Entry): boolean {
	return true;
	//return user.id === '719b795e705340bd82596d6cfcfa4224'
}

export function isAdmin(user: User): boolean {
	return user.id === '719b795e705340bd82596d6cfcfa4224'
}
