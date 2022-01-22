<script lang="ts">
	import * as diff from 'fast-myers-diff'

	export let before: unknown[]
	export let after: unknown[]

	$: patches = Array.from(diff.diff(before, after))

	// how many extra lines should be shown around changes for context
	let contextAmount = 2
</script>

<div>
	<!-- iterate over each line -->
	{#each Array(patches[0][0]) as _, i}
		{@const distanceFromContext = patches[0][0] - i}
		{#if contextAmount >= distanceFromContext}
			<p>{before[i]}</p>
		{/if}
	{/each}

	{#each patches as patch, patchIndex}
		<!-- iterate between the end of this delete and the start of the next one to show the lines in between -->
		{#if patch[0] != patch[1]}
			<!-- delete -->
			{#each before.slice(patch[0], patch[1]) as part}
				<p class="diff-delete">{part}</p>
			{/each}
		{/if}
		{#if patch[2] != patch[3]}
			<!-- insert -->
			{#each after.slice(patch[2], patch[3]) as part}
				<p class="diff-insert">
					{part}
				</p>
			{/each}
		{/if}

		{@const end = patches[patchIndex + 1] ? patches[patchIndex + 1][0] : before.length}
		{@const start = patches[patchIndex][1]}
		{#if patchIndex < patches.length}
			{#each Array(end - start) as _, unoffsetLineNumber}
				{@const lineNumber = unoffsetLineNumber + patch[1]}
				{@const distanceFromContext = Math.min(end - lineNumber, lineNumber - start)}
				{#if contextAmount >= distanceFromContext}
					<p>{before[lineNumber]}</p>
				{/if}
			{/each}
		{/if}
	{/each}
</div>

<style>
	p {
		margin: 0;
		width: 100%;
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
