<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit'
	import Head from '$lib/Head.svelte'

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
	import type { Entry } from '$lib/database'
	import EntryPreview from '$lib/EntryPreview.svelte'
	export let entries: Entry[]
</script>

<Head />

<h1><img src="/icon.png" alt="Repldex Logo" class="title-logo">Repldex</h1>

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

	h1 {
		text-align: center
	}

	.title-logo {
		height: 1em;
		margin-right: .3em;
		position: relative;
		top: .15em;
	}
</style>
