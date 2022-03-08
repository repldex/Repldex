<script lang="ts">
	import Labelled from './Labelled.svelte'

	export let query: string
</script>

<div class="search-container">
	<Labelled text="Search">
		<input class="search-bar" type="text" bind:value={query} />
	</Labelled>
</div>

<style>
	.search-container {
		width: 20em;
		margin: 0 0 0.5em 1rem;
	}
	input {
		width: 100%;
		display: block;
		height: 1em;
	}
</style>
