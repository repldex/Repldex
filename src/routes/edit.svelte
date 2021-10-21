<script lang="ts">
	import MarkdownEditor from '$lib/MarkdownEditor.svelte'
	import TextInput from '$lib/TextInput.svelte'
</script>

<svelte:head>
	<title>Repldex - Edit Entry</title>
</svelte:head>

<div class="text-editor">
	<TextInput placeholder="Title" />
</div>
<MarkdownEditor />
