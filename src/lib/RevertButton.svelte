<script lang="ts">
	export let id: string

	async function revert() {
		// post request to /api/revert/<id>.json
		await fetch(`/api/revert/${id}.json`, { method: 'POST' })
	}
</script>

<button on:click={revert} class="revert-button">Revert</button>
