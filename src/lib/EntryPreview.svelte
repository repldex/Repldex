<script lang="ts">
	import type { Entry } from './database/entries'
	import { browser } from '$app/env'
	export let entry: Entry

	import * as markdown from './markdown'
	import { getEntryViewUrl } from './utils'

	const setTagSearch = (tag: string) => {
		if (browser) {
			let search_bar = document.getElementById('search') as HTMLInputElement
			search_bar.value = 'tags:' + tag.tag.replaceAll(' ', '_')
			//search_bar.oninput()
			search_bar.dispatchEvent(new InputEvent('input'))
		}
	}
</script>

<div
	class="entry-preview-container"
	on:click={() => {
		window.location.href = getEntryViewUrl(entry)
	}}
>
	{#if entry.visibility === 'unlisted'}
		<p class="visibility-warning">Unlisted</p>
	{:else if entry.visibility === 'hidden'}
		<p class="visibility-warning">Hidden</p>
	{/if}

	<a href={getEntryViewUrl(entry)} class="entry-preview-title-link"
		><h2 class="entry-preview-title">{entry.title}</h2></a
	>
	<p class="entry-preview-content">{@html markdown.render(entry.content)}</p>

	{#if entry.tags}
		{#each entry.tags as tag}
			<p
				class="tag"
				on:click={event => {
					setTagSearch({ tag })
					event.cancelBubble = true
				}}
			>
				{tag}
			</p>
		{/each}
	{/if}
</div>

<style>
	.entry-preview-container {
		border: 1px solid var(--alternate-background-color);
		border-radius: 1em;
		padding: 1em;
		display: block;
		color: inherit;
		text-decoration: none;
		cursor: pointer;
	}

	.entry-preview-content {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 5;
		overflow: hidden;
		margin: 0;
	}

	.entry-preview-title-link {
		text-decoration: inherit;
		color: inherit;
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
