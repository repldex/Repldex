<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit'

	export const load: Load = async ({ params, fetch, session }) => {
		const entrySlug: string = params.slug
		const res = await fetch(`/api/entry/${entrySlug}.json`)

		const entry = await res.json()

		if (!session.user) {
			return {
				error: 'You must be logged in to edit entries.',
			}
		}

		return {
			props: {
				entry: entry,
				user: session.user,
			},
		}
	}
</script>

<script lang="ts">
	import type { Entry, Visibility } from '../../lib/database/entries'
	import { goto } from '$app/navigation'
	import MarkdownEditor from '../../lib/inputs/MarkdownEditor.svelte'
	import TextInput from '../../lib/inputs/TextInput.svelte'
	import Head from '../../lib/Head.svelte'
	import Labelled from '../../lib/Labelled.svelte'
	import type { User } from '../../lib/database/users'
	import { getEntryViewUrl } from '../../lib/utils'
	import { isAdmin } from '../../lib/perms'

	export let user: User
	export let entry: Entry

	let entryTitle: string = entry.title
	let entryContent: string = entry.content
	let visibility: Visibility = entry.visibility

	// automatically update the page title
	$: pageTitle = `Edit entry "${entryTitle}"`

	async function submitEntry() {
		// make a put request to /api/entry/<id>.json
		// if successful, redirect to /entry/<slug>

		const response: Entry | { error: string } = await fetch(`/api/entry/${entry.id}.json`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				id: entry.id,
				title: entryTitle,
				content: entryContent,
				visibility: visibility,
			}),
		}).then(response => response.json())

		if ('error' in response) {
			console.error(response.error)
			return
		}

		goto(getEntryViewUrl(response))
	}
</script>

<a href={getEntryViewUrl(entry)} class="back-button">Back</a>

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
