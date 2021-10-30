<script context="module">
	export async function load({ session }) {
		return {
			props: {
				user: session.user,
			},
		}
	}
</script>

<script lang="ts">
	import '../AtkinsonHyperlegible.css'
	import '../app.css'
	import DiscordLoginButton from '../lib/DiscordLoginButton.svelte'
	import type { User } from '../lib/database/users'

	export let user: User
</script>

<nav>
	<div class="discord-login-button-container">
		{#if !user}
			<DiscordLoginButton />
		{:else}
			<a href="/logout">Logout</a>
		{/if}
	</div>
</nav>

<main>
	<slot />
</main>

<style>
	.discord-login-button-container {
		position: absolute;
		right: 1em;
		top: 1em;
	}

	main {
		margin: 1em;
	}
</style>
