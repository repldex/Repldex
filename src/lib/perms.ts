import type { Entry } from './database/entries'
import type { User } from './database/users'

/**
 * Whether the user can create (or rename) entries. Renaming is included here
 * since it often has the same effect as creating a new entry.
 */
export function canCreateEntries(user: User): boolean {
	return user.admin
}

export function canSeeEntry(user: User, entry: Entry): boolean {
	// admins can see all entries
	if (isAdmin(user)) return true
	return entry.visibility !== 'hidden'
}

export function canEditEntry(user: User, entry: Entry): boolean {
	return user.admin
}

export function isAdmin(user: User): boolean {
	return user.admin
}
