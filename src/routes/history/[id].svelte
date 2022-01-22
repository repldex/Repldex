<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit'
	import Head from '../../lib/Head.svelte'

	export const load: Load = async ({ params, fetch }) => {
		const entryId: string = params.id

		// we fetch /entry and /history concurrently
		const entryPromise = fetch(`/api/entry/${entryId}.json`).then(res => res.json())
		const history: APIHistoryResponse = await fetch(`/api/history/${entryId}.json`).then(res =>
			res.json()
		)
		const entry = await entryPromise

		return {
			props: {
				entry,
				historyItems: history.items,
				totalHistoryItemCount: history.count,
			},
		}
	}
</script>

<script lang="ts">
	import type { APIHistoryItem, APIHistoryResponse } from '../api/history/[id].json'
	import type { Entry } from '../../lib/database/entries'
	import Diff from '../../lib/Diff.svelte'
	import User from '../../lib/User.svelte'
	import { format as formatTimeAgo } from 'timeago.js'
	import { browser } from '$app/env'

	export let entry: Entry
	export let historyItems: APIHistoryItem[]
	export let totalHistoryItemCount: number

	let isFetchingNextPage = false
	let pageNumber = 0

	async function checkDoPagination() {
		if (
			window.innerHeight + window.pageYOffset + 500 >= document.body.offsetHeight &&
			!isFetchingNextPage &&
			historyItems.length < totalHistoryItemCount
		) {
			isFetchingNextPage = true
			pageNumber++
			let newHistory: APIHistoryResponse = await fetch(
				`/api/history/${entry.id}.json?page=${pageNumber}`
			).then(r => r.json())
			historyItems = [...historyItems, ...newHistory.items]
			// we update the count again just in case it changed
			totalHistoryItemCount = newHistory.count
			// check again! just in case
			await checkDoPagination()
		}
	}

	if (browser) {
		addEventListener('scroll', checkDoPagination)
		checkDoPagination()
	}
</script>

<Head title={entry.title} description={entry.content} />

<nav class="entry-nav-links">
	<a href="/entry/{entry.slug}">View</a>
	<a href="/edit/{entry.slug}">Edit</a>
</nav>

<h1>{entry.title}</h1>
{#each historyItems as historyItem, i (historyItem.id)}
	{#if i > 0}
		<div class="history-item">
			<User id={historyItem.userId} /> - {formatTimeAgo(historyItem.timestamp)}
			<div class="history-diff">
				<Diff
					before={historyItems[i].content.split('\n')}
					after={historyItems[i - 1].content.split('\n')}
				/>
			</div>
		</div>
		{#if i < historyItems.length - 1}
			<hr />
		{/if}
	{/if}
{/each}

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
