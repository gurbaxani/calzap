<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/calzap.png";
	import Header from "$lib/components/Header.svelte";
	import { afterNavigate, goto } from "$app/navigation";
	import { page } from "$app/state";
	import { store } from "$lib/store.svelte";

	let { children } = $props();
	let isInitialized = $state(false);

	afterNavigate(async () => {
		if (store.initialized) {
			await store.initialized;
		}
		isInitialized = true;

		const path = page.url.pathname;
		const isRoot = path === "/";
		const isHello = path.startsWith("/hello");

		if (!store.userStats.onboarded && !isRoot && !isHello) {
			goto("/hello");
		}
	});

	const showContent = $derived.by(() => {
		const path = page.url.pathname;
		const isRoot = path === "/";
		const isHello = path.startsWith("/hello");

		if (isRoot || isHello) return true;
		return isInitialized && store.userStats.onboarded;
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if showContent}
	<Header />
	{@render children()}
{/if}
