<script lang="ts">
	export let placeholder = ''
	export let value: string
</script>

<input type="text" {placeholder} bind:value />

<style>
	input {
		margin: 0;
		font-size: inherit;
	}
</style>
