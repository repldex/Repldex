<script lang="ts">
	// import type { Entry } from '../routes/api/entries.json.ts'
	export let entry
</script>

<div class="entry-preview-container">
	<h2 class="entry-preview-title">{entry.title}</h2>
	<p>{entry.description}</p>
</div>

<style>
	.entry-preview-container {
		border: 1px solid var(--alternate-background-color);
		border-radius: 1em;
		padding: 1em
	}

	.entry-preview-title {
		margin-top: 0;
	}
</style>