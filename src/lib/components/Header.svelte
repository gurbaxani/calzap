<script lang="ts">
	import { auth } from "$lib/user.svelte";
	import { page } from "$app/state";

	const currentPath = $derived(page.url.pathname);
	const isActive = (path: string) =>
		currentPath === path || currentPath.startsWith(path + "/");
</script>

<!-- Add body padding to ensure content scrolling past fixed bottom dock -->
{#if auth.isValid}
	<style>
		body {
			padding-bottom: 7rem !important;
		}
	</style>
{/if}

{#if !auth.isValid}
	<header class="max-w-md mx-auto w-full px-6 py-5 flex justify-end items-center">
		<div class="flex items-center gap-2">
			<a
				href="/login"
				class="font-bold text-xs uppercase tracking-wider text-muted hover:text-(--fg) transition-colors px-3 py-1.5"
			>
				Log in
			</a>
			<a
				href="/signup"
				class="px-4 py-2 rounded-xl bg-fg text-bg font-bold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-black/5"
			>
				Sign up
			</a>
		</div>
	</header>
{/if}

<!-- Floating Mobile Dock Nav Bar -->
{#if auth.isValid}
	<nav class="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[360px] z-50 bg-(--surface)/90 backdrop-blur-md border border-(--border) rounded-3xl p-2.5 shadow-2xl flex items-center justify-between">
		<!-- Dashboard Tab -->
		<a
			href="/dashboard"
			class="flex flex-col items-center justify-center gap-1 w-16 py-1 rounded-2xl transition-all navigation-tab"
			class:active={isActive('/dashboard')}
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-5">
				<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
			</svg>
			<span class="text-[9px] font-black uppercase tracking-wider">Fuel</span>
		</a>

		<!-- Log Fuel Quick Action (Center Prominent Tab) -->
		<a
			href="/log"
			class="flex items-center justify-center w-12 h-12 rounded-full transition-all log-tab-circle shadow-lg hover:scale-105 active:scale-95"
			class:active={isActive('/log')}
			title="Log Fuel"
			aria-label="Log Fuel"
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3.5" stroke="currentColor" class="size-6">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
			</svg>
		</a>

		<!-- Add Food Tab -->
		<a
			href="/add"
			class="flex flex-col items-center justify-center gap-1 w-16 py-1 rounded-2xl transition-all navigation-tab"
			class:active={isActive('/add')}
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
			</svg>
			<span class="text-[9px] font-black uppercase tracking-wider">Add</span>
		</a>

		<!-- Profile Tab -->
		<a
			href="/profile"
			class="flex flex-col items-center justify-center gap-1 w-16 py-1 rounded-2xl transition-all navigation-tab"
			class:active={isActive('/profile')}
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
			</svg>
			<span class="text-[9px] font-black uppercase tracking-wider">Profile</span>
		</a>
	</nav>
{/if}

<style>
	.text-muted {
		color: var(--color-text-muted);
	}
	.navigation-tab {
		color: var(--color-text-muted);
	}
	.navigation-tab:hover {
		color: var(--color-text);
	}
	.navigation-tab.active {
		color: var(--color-calories);
	}
	.log-tab-circle {
		background-color: var(--color-calories);
		color: white;
	}
	.log-tab-circle:hover {
		filter: brightness(1.05);
	}
	.log-tab-circle.active {
		box-shadow: 0 0 0 4px color-mix(in oklch, var(--color-calories) 25%, transparent);
	}
</style>
