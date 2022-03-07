<script lang="ts">
	export let text: string
</script>

<label>
	<span class="label-text">{text}</span>
	<div aria-label={text}><slot /></div>
</label>

<style>
	.label-text {
		font-size: 0.9em;

		position: relative;
		margin-left: 0.1em;
		opacity: 0.8;
		letter-spacing: 0.03em;
	}
</style>
