<script lang="ts">
	import '../AtkinsonHyperlegible.css'
	import '../app.css'
	import DiscordLoginButton from '$lib/DiscordLoginButton.svelte'
</script>

<nav>
	<div class="discord-login-button-container">
		<DiscordLoginButton />
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
