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

<header class="max-w-md mx-auto w-full px-6 py-5 flex justify-between items-center">
	<!-- Brand Logo -->
	{#if auth.isValid}
		<a href="/dashboard" class="flex items-center gap-2 hover:opacity-95 transition-opacity group">
			<div class="w-7 h-7 rounded-lg bg-[var(--color-calories)] flex items-center justify-center group-hover:scale-105 transition-transform">
				<span class="text-white font-black text-base tracking-tighter">F</span>
			</div>
			<span class="font-black text-lg tracking-tighter">Food Factor</span>
		</a>
	{:else}
		<a href="/" class="flex items-center gap-2 hover:opacity-95 transition-opacity group">
			<div class="w-7 h-7 rounded-lg bg-[var(--color-calories)] flex items-center justify-center group-hover:scale-105 transition-transform">
				<span class="text-white font-black text-base tracking-tighter">F</span>
			</div>
			<span class="font-black text-lg tracking-tighter">Food Factor</span>
		</a>
	{/if}

	<!-- Right Side Action (Only visible when logged out) -->
	{#if !auth.isValid}
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
	{/if}
</header>

<!-- Floating Mobile Dock Nav Bar -->
{#if auth.isValid}
	<nav class="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[360px] z-50 bg-(--surface)/90 backdrop-blur-md border border-(--border) rounded-3xl p-2.5 shadow-2xl flex items-center justify-between">
		<!-- Dashboard Tab -->
		<a
			href="/dashboard"
			class="flex flex-col items-center justify-center gap-1 w-16 py-1 rounded-2xl transition-all navigation-tab"
			class:active={isActive('/dashboard')}
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
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
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
		</a>

		<!-- Add Food Tab -->
		<a
			href="/add"
			class="flex flex-col items-center justify-center gap-1 w-16 py-1 rounded-2xl transition-all navigation-tab"
			class:active={isActive('/add')}
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
			<span class="text-[9px] font-black uppercase tracking-wider">Add</span>
		</a>

		<!-- Profile Tab -->
		<a
			href="/profile"
			class="flex flex-col items-center justify-center gap-1 w-16 py-1 rounded-2xl transition-all navigation-tab"
			class:active={isActive('/profile')}
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
