<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit'
	import Head from '../../lib/Head.svelte'

	export const load: Load = async ({ params, fetch }) => {
		const entryId: string = params.id

		// we fetch /entry and /history concurrently
		const entryPromise = fetch(`/api/entry/${entryId}.json`).then(res => res.json())
		const history = await fetch(`/api/history/${entryId}.json`).then(res => res.json())
		const entry = await entryPromise

		return {
			props: {
				entry,
				history,
			},
		}
	}

	import * as markdown from '../../lib/markdown'
</script>

<script lang="ts">
	import type { APIHistoryItem } from '../api/history/[id].json'
	import type { Entry } from '../../lib/database/entries'
	import Diff from '../../lib/Diff.svelte'
	import User from '../../lib/User.svelte'
	export let entry: Entry
	export let history: APIHistoryItem[]
</script>

<Head title={entry.title} description={entry.content} />

<nav class="entry-nav-links">
	<a href="/entry/{entry.slug}">View</a>
	<a href="/edit/{entry.slug}">Edit</a>
</nav>

<h1>{entry.title}</h1>
{#each history.slice(0, -1) as historyItem, i}
	<div class="history-item">
		<User id={historyItem.userId} /> - {historyItem.timestamp}
		<Diff before={history[i + 1].content.split('\n')} after={history[i].content.split('\n')} />
	</div>
	{#if i < history.length - 2}
		<hr />
	{/if}
{/each}

<!-- <article>{@html markdown.render(entry.content)}</article> -->
<style>
	.entry-nav-links {
		position: absolute;
		top: 1rem;
	}

	.entry-nav-links > a {
		margin-right: 0.5rem;
	}

	h1 {
		margin-top: 3rem;
	}

	.history-item {
		margin-bottom: 2rem;
	}
	hr {
		margin-bottom: 2rem;
		width: 99%;
	}

	@media (max-width: 260px) {
		.entry-nav-links,
		h1 {
			padding-top: 2rem;
		}
		.entry-nav-links {
			right: 1em;
		}
		.entry-nav-links a {
			margin-right: 0;
		}
	}
</style>
