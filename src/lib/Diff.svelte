<script lang="ts">
    import * as diff from 'fast-myers-diff'

	export let before: unknown[]
	export let after: unknown[]

    $: patches = Array.from(diff.diff(before, after))
</script>

<div>
    <!-- iterate over each line -->
    <!-- {#each Array(patches[0][0]) as _, i}
        <p>{before[i]}</p>
    {/each} -->

    {#each patches as patch, patchIndex}
        <!-- iterate between the end of this delete and the start of the next one to show the lines in between -->
        {#if patchIndex > 0}
            {#each Array(patches[patchIndex][0] - patches[patchIndex - 1][1]) as _, unoffsetLineNumber}
                {@const lineNumber = unoffsetLineNumber + patch[1]}
                <p>line: {before[lineNumber]}</p>
            {/each}
        {/if}

        {#if patch[0] != patch[1]}
            <!-- delete -->
            <p class="diff-delete">{before.slice(patch[0], patch[1])}</p>
        {/if}
        {#if patch[2] != patch[3]}
            <!-- insert -->
            <p class="diff-insert">insert: {after.slice(patch[0], patch[1])}</p>
        {/if}
    {/each}
</div>

<style>
    p {
        margin: .1em 0;
        width: fit-content;
    }

    .diff-delete {
        background-color: #fd2c2166;
    }

    .diff-insert {
        background-color: #09d82f66;
    }
</style>
