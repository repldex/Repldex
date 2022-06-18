<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit'

	export const load: Load = async ({ session }) => {
		if (!session.user) {
			return {
				error: 'You must be logged in to create entries.',
			}
		}

		return {
			props: {
				user: session.user,
			},
		}
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation'

	import MarkdownEditor from '../../lib/inputs/MarkdownEditor.svelte'
	import TextInput from '../../lib/inputs/TextInput.svelte'
	import Head from '../../lib/Head.svelte'
	import Labelled from '../../lib/Labelled.svelte'
	import { getEntryViewUrl } from '../../lib/utils'
	import type { Entry, Visibility } from '../../lib/database/entries'
	import { isAdmin } from '../../lib/perms'
	import type { User } from '../../lib/database/users'

	export let user: User

	let visibility: Visibility = 'unlisted'

	let entryTitle = ''
	let entryContent = ''
	let entryTags = ''

	// automatically update the page title
	let pageTitle = 'Create entry'
	$: {
		pageTitle = entryTitle.length ? `New entry "${entryTitle}"` : 'New entry'
	}

	async function submitEntry() {
		// make a post/put request to /api/entries.json
		// if successful, redirect to /entry/<slug>
		entryTags = entryTags.split(',')
		if (entryTags.length == 1 && entryTags[0] == '') {
			entryTags = []
		}
		const response: Entry | { error: string } = await fetch('/api/entries.json', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				title: entryTitle,
				content: entryContent,
				tags: entryTags,
				visibility,
			}),
		}).then(response => response.json())

		if ('error' in response) {
			console.error(response.error)
			return
		}

		goto(getEntryViewUrl(response))
	}
</script>

<a href="/" class="back-button">Back</a>

<div id="editor-container">
	<div id="editor-container-container">
		<Head title={pageTitle} />

		{#if isAdmin(user)}
			<div class="visibility">
				<Labelled text="Visibility">
					<select bind:value={visibility}>
						<option value="visible" selected>Visible</option>
						<option value="unlisted">Unlisted</option>
						<option value="hidden">Hidden</option>
					</select>
				</Labelled>
			</div>
		{/if}

		<div class="text-editor">
			<Labelled text="Title">
				<TextInput bind:value={entryTitle} />
			</Labelled>
		</div>

		<Labelled text="Content">
			<MarkdownEditor bind:value={entryContent} />
		</Labelled>

		<div class="tags">
			<Labelled text="Tags (seperated with commas)">
				<TextInput bind:value={entryTags} />
			</Labelled>
		</div>

		<button on:click={submitEntry}>Save</button>
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

	.tags {
		margin-top: 1rem;
		margin-bottom: 1rem;
	}

	/* vertically align */
	#editor-container {
		display: grid;
		align-items: center;
		height: 100vh;
		margin-top: 1.5rem;
	}

	button {
		margin-top: 0.5em;
	}

	.visibility {
		float: right;
	}
</style>
