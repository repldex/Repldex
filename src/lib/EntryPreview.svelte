<script lang="ts">
	// import type { Entry } from '../routes/api/entries.json.ts'
	export let entry
</script>

<div class="entry-preview-container">
	<h2 class="entry-preview-title">{entry.title}</h2>
	<p class="entry-preview-content">{entry.description}</p>
</div>

<style>
	.entry-preview-container {
		border: 1px solid var(--alternate-background-color);
		border-radius: 1em;
		padding: 1em;
	}
	.entry-preview-content {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 5;
		overflow: hidden;
		margin: 0
	}

	.entry-preview-title {
		margin-top: 0;
		margin-bottom: .25em
	}
</style>