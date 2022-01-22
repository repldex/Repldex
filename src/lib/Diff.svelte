<script lang="ts">
	import * as diff from 'fast-myers-diff'

	export let before: unknown[]
	export let after: unknown[]

	$: patches = Array.from(diff.diff(before, after))
</script>

<div>
	<!-- iterate over each line -->
	{#each Array(patches[0][0]) as _, i}
		<p>{before[i]}</p>
	{/each}

	{#each patches as patch, patchIndex}
		<!-- iterate between the end of this delete and the start of the next one to show the lines in between -->
		{#if patch[0] != patch[1]}
			<!-- delete -->
			<p class="diff-delete">{before.slice(patch[0], patch[1])}</p>
		{/if}
		{#if patch[2] != patch[3]}
			<!-- insert -->
			<p class="diff-insert">{after.slice(patch[0], patch[1])}</p>
		{/if}

		{#if patchIndex < patches.length}
			{#each Array((patches[patchIndex + 1] ? patches[patchIndex + 1][0] : before.length) - patches[patchIndex][1]) as _, unoffsetLineNumber}
				{@const lineNumber = unoffsetLineNumber + patch[1]}
				<p>{before[lineNumber]}</p>
			{/each}
		{/if}
	{/each}
</div>

<style>
	p {
		margin: 0.1em 0;
		width: fit-content;
		/* the min-height is necessary so empty lines work */
		min-height: 1em;
	}

	.diff-delete {
		background-color: #fd2c2166;
	}

	.diff-insert {
		background-color: #09d82f66;
	}
</style>
