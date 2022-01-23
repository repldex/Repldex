import type { Entry } from './database/entries'
import type { User } from './database/users'

// only mat can create/edit entries for now, this will be changed once moderation (anti vandalism, banning, etc) is added

/// Whether the user can create (or rename) entries. Renaming is included here
/// since it often has the same effect as creating a new entry.
export async function canCreateEntries(user: User): Promise<boolean> {
	return user.id === '719b795e705340bd82596d6cfcfa4224'
}

export async function canEditEntry(user: User, entry: Entry): Promise<boolean> {
	return user.id === '719b795e705340bd82596d6cfcfa4224'
}
