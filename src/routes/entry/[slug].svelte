<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit'
	import Head from '$lib/Head.svelte'

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
	import type { Entry } from '$lib/database.js'
	import EntryPreview from '$lib/EntryPreview.svelte'
	export let entry: Entry
</script>

<Head title={entry.title} />

<h1>{entry.title}</h1>
<p>{entry.content}</p>
