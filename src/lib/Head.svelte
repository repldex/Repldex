<script lang="ts">
	export let title: string = 'Repldex'
	export let description: string =
		'Repldex is the unofficial community-editable encyclopedia of user created entries for the Replit Discord Server'
	export let imageUrl: string | undefined = undefined
	export let noIndex = false
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	{#if imageUrl}
		<meta property="og:image" content={imageUrl} />
	{/if}
	{#if noIndex}
		<meta name="robots" content="noindex" />
	{/if}
</svelte:head>
