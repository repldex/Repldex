<script lang="ts">
	import { goto } from '$app/navigation'

	import MarkdownEditor from '../../lib/inputs/MarkdownEditor.svelte'
	import TextInput from '../../lib/inputs/TextInput.svelte'
	import Head from '../../lib/Head.svelte'
	import Labelled from '../../lib/Labelled.svelte'

	let entryTitle: string = ''
	let entryContent: string = ''

	// automatically update the page title
	let pageTitle: string = 'Create entry'
	$: {
		pageTitle = entryTitle.length ? `New entry "${entryTitle}"` : 'New entry'
	}

	async function submitEntry() {
		// make a post/put request to /api/entries.json
		// if successful, redirect to /entry/<slug>

		const response = await fetch('/api/entries.json', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
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

<a href="/entry/{entryTitle}" class="back-button">Back</a>

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

		<button on:click={submitEntry}>Submit</button>
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
