<script lang="ts">
	import { goto } from '$app/navigation'

	export let id: string

	async function revert() {
		// post request to /api/revert/<id>.json
		await fetch(`/api/revert/${id}.json`, { method: 'POST' }).then(res => res.json())
		location.reload()
	}
</script>

<button on:click={revert} class="revert-button">Revert</button>
