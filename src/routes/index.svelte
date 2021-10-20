<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit'
	export const load: Load = async ({ page, fetch, session, stuff }) => {
		const res = await fetch('/api/entries.json')
  
		return {
			props: {
				entries: await res.json(),
			},
		}
	}
</script>

<script lang="ts">
	import type { Entry } from './api/entries.json.ts'
	import EntryPreview from '$lib/EntryPreview.svelte'
	export let entries: Entry[]
</script>

<svelte:head>
	<title>Repldex 3</title>
</svelte:head>

<h1>Repldex 3</h1>

<div class="entry-list">
	{#each entries as entry}
		<EntryPreview {entry} />
	{/each}
</div>

<style>
	.entry-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(20em, 1fr));
		grid-gap: 0.5em;
	}
</style>
