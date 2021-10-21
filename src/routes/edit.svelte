<script lang="ts">
	import MarkdownEditor from '$lib/MarkdownEditor.svelte'
	import TextInput from '$lib/TextInput.svelte'
	import Head from '$lib/Head.svelte'

	let entryTitle: string = ''
	let entryContent: string = ''

	let initialTitle: string = ''

	let pageTitle: string = 'Create entry'

	const isCreatingEntry = entryTitle.length === 0

	$: {
		if (isCreatingEntry)
			if (entryTitle.length)
				pageTitle = `New entry "${entryTitle}"`
			else
				pageTitle = `New entry`
		else
			if (entryTitle.length)
				pageTitle = `Edit entry`
			else
				pageTitle = `Edit entry "${entryTitle}"`
	}
</script>

<Head title={pageTitle} />

<div class="text-editor">
	<TextInput placeholder="Title" bind:value={entryTitle} />
</div>
<MarkdownEditor bind:value={entryContent} />
<button>Submit</button>
