<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/calzap.png";
	import Header from "$lib/components/Header.svelte";
	import { afterNavigate, goto } from "$app/navigation";
	import { page } from "$app/state";
	import { store } from "$lib/store.svelte";

	import { dev } from "$app/environment";
	import { onMount } from "svelte";

	let { children } = $props();
	let isInitialized = $state(false);

	onMount(() => {
		if ("serviceWorker" in navigator && !dev) {
			navigator.serviceWorker.register("/service-worker.js")
				.catch((err) => console.error("Service worker registration failed:", err));
		}
	});

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

<svelte:head>
<link rel="icon" href={favicon} />
<script defer data-domain="calzap.ashwinig.com" src="https://plausible.ashwinig.com/js/script.js"></script>
</svelte:head>

{#if showContent}
	<Header />
	{@render children()}
{/if}
