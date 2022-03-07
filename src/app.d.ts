/// <reference types="@sveltejs/kit" />

declare namespace App {
	interface Locals {
		user: import('./lib/database/users').BasicUser | null
	}

	// interface Platform {}

	interface Session {
		user: import('./lib/database/users').User | null
	}

	// interface Stuff {}
}
