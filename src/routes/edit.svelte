<script lang="ts">
	import MarkdownEditor from '$lib/MarkdownEditor.svelte'
	import TextInput from '$lib/TextInput.svelte'
	import Head from '$lib/Head.svelte'

	let entryTitle: string = ''
	let entryContent: string = ''

	let initialTitle: string = ''
</script>

<Head title="Edit entry" />

<div class="text-editor">
	<TextInput placeholder="Title" bind:content={entryTitle} />
</div>
<MarkdownEditor bind:content={entryContent} />
<button>Submit</button>
