<script lang="ts">
	export let placeholder: string
	export let value: string
</script>

<input type="text" {placeholder} bind:value />

<style>
	input {
		margin: 0;
	}
</style>
