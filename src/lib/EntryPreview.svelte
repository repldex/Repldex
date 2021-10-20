<script lang="ts">
	// import type { Entry } from '../routes/api/entries.json.ts'
	export let entry
</script>

<a class="entry-preview-container" href="/entry/{entry.slug}">
	<h2 class="entry-preview-title">{entry.title}</h2>
	<p class="entry-preview-content">{entry.content}</p>
</a>

<style>
	.entry-preview-container {
		border: 1px solid var(--alternate-background-color);
		border-radius: 1em;
		padding: 1em;
		display: block;
		color: inherit;
		text-decoration: none;
	}
	.entry-preview-content {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 5;
		overflow: hidden;
		margin: 0;
	}

	.entry-preview-title {
		margin-top: 0;
		margin-bottom: 0.25em;
	}
</style>
