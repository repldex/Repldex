<script lang="ts">
	export let title: string = 'Repldex'
  export let description: string = 'Repldex is the unofficial community-editable encyclopedia of user created entries for the Replit Discord Server'
  export let sitename: string = ''
</script>

<svelte:head>
	<title>{title}</title>
  <meta name="description" content="{description}" />
  <meta name="og:site_name" content="{sitename}" />
  <meta name="theme-color" content="#FF0000" />
</svelte:head>
