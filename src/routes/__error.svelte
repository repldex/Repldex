<script lang="ts" context="module">
	import type { ErrorLoad } from '@sveltejs/kit'

	export const load: ErrorLoad = async ({ error, status }) => {
		return {
			props: {
				status,
				message: error?.message,
			},
		}
	}
</script>

<script>
	import Head from '../lib/Head.svelte'

	export let status
	export let message
</script>

<Head title={status} description={message} />

<div class="error-container-container">
	<div class="error-container">
		<h1>{status}</h1>
		{#if message}
			<h2>{message}</h2>
		{/if}
		<a href="/">Go back</a>
	</div>
</div>

<style>
	h1 {
		width: 100%;
		font-size: 5rem;
		margin: 0;
	}
	h2 {
		margin: 0;
		opacity: 0.5;
		font-weight: normal;
	}
	a {
		margin-top: 0.5em;
		display: block;
	}
	.error-container-container {
		text-align: center;
		display: grid;
		align-items: center;
		height: 100vh;
		overflow: hidden;
	}
</style>
