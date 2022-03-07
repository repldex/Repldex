<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit'
	import Head from '../lib/Head.svelte'
	import { isAdmin } from '../lib/perms'

	export const load: Load = async ({ session, fetch }) => {
		const res = await fetch('/api/entries.json')

		const admin = session.user ? isAdmin(session.user) : false

		return {
			props: {
				entries: await res.json(),
				canShowUnlisted: session.user ? true : false,
				canShowHidden: admin,
			},
		}
	}
</script>

<script lang="ts">
	import type { Entry } from '../lib/database/entries'
	import EntryPreview from '../lib/EntryPreview.svelte'
	import Labelled from '../lib/Labelled.svelte'
	import { browser } from '$app/env'

	export let entries: Entry[]
	export let canShowUnlisted: boolean
	export let canShowHidden: boolean

	let showVisible = true
	let showUnlisted = false
	let showHidden = false

	let fetchIndex = 0

	async function updateEntries() {
		fetchIndex += 1
		let thisFetchIndex = fetchIndex
		const res = await fetch(
			`/api/entries.json?visible=${showVisible}&unlisted=${showUnlisted}&hidden=${showHidden}`
		)
		const newEntries = await res.json()

		if (thisFetchIndex === fetchIndex) entries = newEntries
	}

	$: {
		;[showVisible, showUnlisted, showHidden]
		if (browser) {
			updateEntries()
		}
	}
</script>

<Head imageUrl="/icon-small.svg" />

<h1>
	<img src="/icon-small.svg" alt="Repldex Logo" class="title-logo" />

	<span class="title-text">Repldex</span>
</h1>

{#if canShowUnlisted}
	<div class="visibility-toggles-container">
		<Labelled text="Filter">
			<div class="visibility-toggles">
				<label class="visible-toggle">
					<input type="checkbox" id="show-visible" bind:checked={showVisible} />
					<span>Visible</span>
				</label>
				<label class="unlisted-toggle">
					<input type="checkbox" id="show-unlisted" bind:checked={showUnlisted} />
					<span>Unlisted</span>
				</label>
				{#if canShowHidden}
					<label class="hidden-toggle">
						<input type="checkbox" id="show-hidden" bind:checked={showHidden} />
						<span>Hidden</span>
					</label>
				{/if}
			</div>
		</Labelled>
	</div>
{/if}

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
		box-shadow: 0 0 0.5em #0004;
		letter-spacing: 0.05ch;
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

	.visible-toggle {
		border-right: 2px solid var(--background-color);
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
