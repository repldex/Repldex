<script lang="ts">
	import MarkdownEditor from '../lib/MarkdownEditor.svelte'
	import TextInput from '../lib/TextInput.svelte'
	import Head from '../lib/Head.svelte'
	import Labelled from '../lib/Labelled.svelte'

	let entryTitle: string = ''
	let entryContent: string = ''

	// automatically update the page title
	let initialTitle: string = ''
	let pageTitle: string = 'Create entry'
	const isCreatingEntry = entryTitle.length === 0
	$: {
		if (isCreatingEntry)
			if (entryTitle.length) pageTitle = `New entry "${entryTitle}"`
			else pageTitle = `New entry`
		else if (entryTitle.length) pageTitle = `Edit entry`
		else pageTitle = `Edit entry "${entryTitle}"`
	}

	async function submitEntry() {
		// make a post/put request to /api/entries.json
		// if successful, redirect to /entry/<slug>

		const response = await fetch('/api/entries.json', {
			method: isCreatingEntry ? 'POST' : 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				title: entryTitle,
				content: entryContent,
			}),
		}).then(response => response.json())

		console.log(response)
	}
</script>

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

<style>
	.text-editor {
		margin-bottom: 1rem;
	}
</style>
