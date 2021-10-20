<script lang="ts">
	import '../AtkinsonHyperlegible.css'
	import '../app.css'
	import DiscordLoginButton from '$lib/DiscordLoginButton.svelte'
</script>

<nav>
	<DiscordLoginButton />
</nav>

<main>
	<slot />
</main>
