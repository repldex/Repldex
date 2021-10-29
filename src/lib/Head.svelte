<script lang="ts">
	export let title: string = 'Repldex'
	export let description: string =
		'Repldex is the unofficial community-editable encyclopedia of user created entries for the Replit Discord Server'
	export let image: string = '/icon.png'
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="og:image" content={image} />
</svelte:head>
