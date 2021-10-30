<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit'
	import Head from '../../lib/Head.svelte'

	export const load: Load = async ({ page, fetch, session, stuff }) => {
		const entrySlug: string = page.params.slug
		const res = await fetch(`/api/entry/${entrySlug}.json`)

		return {
			props: {
				entry: await res.json(),
			},
		}
	}
</script>

<script lang="ts">
	import type { Entry } from '../../lib/database/entries'
	export let entry: Entry
</script>

<Head title={entry.title} description={entry.content} />

<a href="/" class="back-button">Back</a>

<h1>{entry.title}</h1>
<article>{entry.content}</article>

<style>
	.back-button {
		position: absolute;
		top: 1rem;
		left: 1rem;
	}
</style>
