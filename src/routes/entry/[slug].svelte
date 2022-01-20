<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit'
	import Head from '../../lib/Head.svelte'

	export const load: Load = async ({ params, fetch }) => {
		const entrySlug: string = params.slug
		const res = await fetch(`/api/entry/${entrySlug}.json`)

		return {
			props: {
				entry: await res.json(),
			},
		}
	}

	import * as markdown from '../../lib/markdown'
</script>

<script lang="ts">
	import type { Entry } from '../../lib/database/entries'
	export let entry: Entry
</script>

<Head title={entry.title} description={entry.content} />

<a href="/" class="back-button">Back</a>

<div class="entry-content">
	<h1>{entry.title}</h1>
	<article>{@html markdown.render(entry.content)}</article>
</div>

<style>
	.back-button {
		position: absolute;
		top: 1rem;
		left: 1rem;
	}

	.entry-content {
		padding-top: 3rem;
		padding-left: 1rem;
	}
</style>
