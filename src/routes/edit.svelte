<script lang="ts">
	import MarkdownEditor from '$lib/MarkdownEditor.svelte'
	import TextInput from '$lib/TextInput.svelte'
</script>

<svelte:head>
	<title>Repldex - Edit Entry</title>
</svelte:head>

<TextInput placeholder="Title" />
<MarkdownEditor />
