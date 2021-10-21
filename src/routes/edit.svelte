<script lang="ts">
	import MarkdownEditor from '$lib/MarkdownEditor.svelte'
	import TextInput from '$lib/TextInput.svelte'
	import Head from '$lib/Head.svelte'
	import Labelled from '$lib/Labelled.svelte'

	let entryTitle: string = ''
	let entryContent: string = ''

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

<button>Submit</button>
