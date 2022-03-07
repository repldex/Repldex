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

{#if entry.visibility === 'unlisted'}
	<p class="visibility-warning">Unlisted</p>
{:else if entry.visibility === 'hidden'}
	<p class="visibility-warning">Hidden</p>
{/if}
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
		margin-right: 1rem;
	}

	.entry-nav-links > a {
		margin-right: 0.5rem;
	}

	.visibility-warning {
		float: right;
		border: 2px solid var(--alternate-background-color);
		padding: 0.2rem;
		border-radius: 0.2rem;
		margin: 0;
		margin-top: 3rem;
		opacity: 0.5;
	}

	h1 {
		margin-top: 3rem;
	}

	/* if entry-nav-links is too close to the back button, put it right next to it */
	@media (max-width: 1090px) {
		.entry-nav-links {
			left: 4rem;
		}
	}

	@media (max-width: 320px) {
		.entry-nav-links,
		h1 {
			padding-top: 2rem;
		}
		.entry-nav-links {
			left: 1em;
			margin-right: 0;
		}
	}
</style>
