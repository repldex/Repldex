<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit'
	import Head from '../lib/Head.svelte'

	export const load: Load = async ({ fetch }) => {
		const res = await fetch('/api/entries.json')

		return {
			props: {
				entries: await res.json(),
			},
		}
	}
</script>

<script lang="ts">
	import type { Entry } from '../lib/database/entries'
	import EntryPreview from '../lib/EntryPreview.svelte'
	import Labelled from '../lib/Labelled.svelte'
	export let entries: Entry[]
</script>

<Head imageUrl="/icon-small.svg" />

<h1>
	<img src="/icon-small.svg" alt="Repldex Logo" class="title-logo" />

	<span class="title-text">Repldex</span>
</h1>

<div class="visibility-toggles-container">
	<Labelled text="Filter">
		<div class="visibility-toggles">
			<label class="visible-toggle">
				<input type="checkbox" id="show-visible" />
				<span>Visible</span>
			</label>
			<label class="unlisted-toggle">
				<input type="checkbox" id="show-unlisted" />
				<span>Unlisted</span>
			</label>
			<label class="deleted-toggle">
				<input type="checkbox" id="show-deleted" />
				<span>Deleted</span>
			</label>
		</div>
	</Labelled>
</div>

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
		padding: 0 1em;
	}

	h1 {
		text-align: center;
		color: var(--bright-text-color);
	}

	.title-logo {
		width: 1em;
		height: 1em;
		margin-right: 0.3em;
		position: relative;
		top: 0.15em;
	}

	.visibility-toggles-container {
		width: 100%;
		display: block;
		height: fit-content;
		display: flex;
		justify-content: flex-end;
	}
	.visibility-toggles {
		border-radius: 0.5em;
		white-space: normal;
		display: flex;
		overflow: hidden;
		width: fit-content;
		margin-bottom: 1em;
		border: 1px solid var(--alternate-background-color);
	}
	.visibility-toggles input[type='checkbox'] {
		display: none;
	}
	.visibility-toggles > label > span {
		background-color: var(--background-color);
		padding: 0.5rem;
		margin: 0;
		border-radius: 0;
		cursor: pointer;
		display: inline-block;
		transition: background-color 100ms;
	}
	.visibility-toggles input[type='checkbox']:checked ~ span {
		background-color: var(--alternate-background-color);
		color: var(--bright-text-color);
	}

	/* move the logo to the left if the screen is less than 500px */
	@media (max-width: 500px) {
		h1 {
			position: absolute;
			left: 1rem;
			top: 1rem;
			margin: 0;
		}

		.entry-list {
			padding-top: 5em;
		}
	}

	/* hide the title text if the screen is less than 340px */
	@media (max-width: 340px) {
		.title-text {
			display: none;
		}
	}
</style>
