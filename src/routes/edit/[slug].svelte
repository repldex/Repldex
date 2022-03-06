<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit'

	export const load: Load = async ({ params, fetch }) => {
		const entrySlug: string = params.slug
		const res = await fetch(`/api/entry/${entrySlug}.json`)

		return {
			props: {
				entry: await res.json(),
			},
		}
	}
</script>

<script lang="ts">
	import type { Entry } from '../../lib/database/entries'
	import { goto } from '$app/navigation'
	import MarkdownEditor from '../../lib/MarkdownEditor.svelte'
	import TextInput from '../../lib/TextInput.svelte'
	import Head from '../../lib/Head.svelte'
	import Labelled from '../../lib/Labelled.svelte'

	export let entry: Entry

	let entryTitle: string = entry.title
	let entryContent: string = entry.content

	// automatically update the page title
	$: pageTitle = `Edit entry "${entryTitle}"`

	async function submitEntry() {
		// make a put request to /api/entry/<id>.json
		// if successful, redirect to /entry/<slug>

		const response = await fetch(`/api/entry/${entry.id}.json`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				id: entry.id,
				title: entryTitle,
				content: entryContent,
			}),
		}).then(response => response.json())

		if (response.error) {
			console.error(response.error)
			return
		}

		goto(`/entry/${response.slug}`)
	}
</script>

<a href="/entry/{entry.slug}" class="back-button">Back</a>

<div id="editor-container">
	<div id="editor-container-container">
		<Head title={pageTitle} />

		<div class="text-editor">
			<Labelled text="Title">
				<TextInput bind:value={entryTitle} />
			</Labelled>
		</div>
		<Labelled text="Content">
			<MarkdownEditor bind:value={entryContent} />
		</Labelled>

		<button on:click={submitEntry}>Update</button>
	</div>
</div>

<style>
	.back-button {
		position: absolute;
		top: 1rem;
		left: 1rem;
	}

	.text-editor {
		margin-bottom: 1rem;
	}

	/* vertically align */
	#editor-container {
		display: grid;
		align-items: center;
		height: 100vh;
	}

	button {
		margin-top: 0.5em;
	}
</style>
