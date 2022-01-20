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

<nav class="entry-nav-links">
	<a href="/edit/{entry.slug}">Edit</a>
	<a href="/history/{entry.id}">History</a>
</nav>

<h1>{entry.title}</h1>
<article>{@html markdown.render(entry.content)}</article>

<style>
	.back-button {
		position: absolute;
		top: 1rem;
		left: 1rem;
	}

	.entry-nav-links {
		position: absolute;
		top: 1rem;
	}

	.entry-nav-links > a {
		margin-right: 0.5rem;
	}

	article,
	h1,
	.entry-nav-links {
		/* we do this instead of margin: 0 1rem so the margin-top is respected */
		margin-right: 1rem;
		margin-left: 1rem;
	}

	h1 {
		margin-top: 3rem;
	}

	/* if entry-nav-links is too close to the back button, put it right next to it */
	@media (max-width: 1060px) {
		.entry-nav-links {
			left: 3rem;
		}
	}

	@media (max-width: 320px) {
		.entry-nav-links,
		h1 {
			padding-top: 2rem;
		}
		.entry-nav-links {
			left: 0;
			margin-right: 0;
		}
	}
</style>
