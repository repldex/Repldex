<script lang="ts">
	import type { Entry } from './database/entries'

	export let entry: Entry

	import * as markdown from './markdown'
	import { getEntryViewUrl } from './utils'

	function setTagSearch(tag) {
		let search_bar = document.getElementById('search') as HTMLInputElement
		search_bar.value = 'tags:' + tag.tag.replaceAll(' ', '_')
	}
</script>

<a class="entry-preview-container" href={getEntryViewUrl(entry)}>
	{#if entry.visibility === 'unlisted'}
		<p class="visibility-warning">Unlisted</p>
	{:else if entry.visibility === 'hidden'}
		<p class="visibility-warning">Hidden</p>
	{/if}

	<h2 class="entry-preview-title">{entry.title}</h2>
	<p class="entry-preview-content">{@html markdown.render(entry.content)}</p>

	{#if entry.tags}
		{#each entry.tags as tag}
			<p class="tag" on:click|stopPropagation={() => setTagSearch({ tag })}>{tag}</p>
		{/each}
	{/if}
</a>

<style>
	.entry-preview-container {
		border: 1px solid var(--alternate-background-color);
		border-radius: 1em;
		padding: 1em;
		display: block;
		color: inherit;
		text-decoration: none;
	}

	.entry-preview-content {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 5;
		overflow: hidden;
		margin: 0;
	}

	.entry-preview-title {
		margin-top: 0;
		margin-bottom: 0.15em;
	}

	.visibility-warning {
		float: right;
		border: 2px solid var(--alternate-background-color);
		padding: 0.2rem;
		border-radius: 0.2rem;
		margin: 0;
		position: relative;
		top: -0.5em;
		right: -0.5em;
		margin-left: 5px;
		box-shadow: 0 0 0.5em #0004;
		letter-spacing: 0.05ch;
	}

	.tag {
		float: right;
		border: 2px solid var(--alternate-background-color);
		padding: 0.2rem;
		border-radius: 0.2rem;
		margin: 0;
		position: relative;
		bottom: -0.5em;
		margin-left: 5px;
		right: -0.5em;
		box-shadow: 0 0 0.5em #0004;
		letter-spacing: 0.05ch;
	}
</style>
