<script lang="ts">
	import type { APIUser } from './database/users'

	/** The id of the user */
	export let id: string

	async function fetchUser(userId: string): Promise<APIUser> {
		const r = await fetch(`/api/user/${userId}.json`)
		const u = await r.json()
		return u
	}
</script>

{#await fetchUser(id)}
	<span class="user loading">
		{id.slice(0, 8)}
	</span>
{:then user}
	<span class="user">
		{user.username}
	</span>
{:catch error}
	<span class="user error">
		{error.message}
	</span>
{/await}

<style>
	.user.error {
		color: red;
	}
	.user.loading {
		background-color: #333;
	}
</style>
