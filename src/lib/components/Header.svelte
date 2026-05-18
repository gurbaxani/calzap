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
	<nav class="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[300px] z-50 bg-(--surface)/90 backdrop-blur-md border border-(--border) rounded-3xl p-2.5 shadow-2xl flex items-center justify-between">
		<!-- Dashboard Tab -->
		<a
			href="/dashboard"
			class="flex flex-col items-center justify-center gap-1 w-16 py-1 rounded-2xl transition-all navigation-tab"
			class:active={isActive('/dashboard')}
		>
			<span class="material-symbols-outlined text-[20px] leading-none">home</span>
			<span class="text-[9px] font-black uppercase tracking-wider">Fuel</span>
		</a>

		<!-- Add Food Tab -->
		<a
			href="/add"
			class="flex flex-col items-center justify-center gap-1 w-16 py-1 rounded-2xl transition-all navigation-tab"
			class:active={isActive('/add')}
		>
			<span class="material-symbols-outlined text-[20px] leading-none">add_circle</span>
			<span class="text-[9px] font-black uppercase tracking-wider">Add</span>
		</a>

		<!-- Profile Tab -->
		<a
			href="/profile"
			class="flex flex-col items-center justify-center gap-1 w-16 py-1 rounded-2xl transition-all navigation-tab"
			class:active={isActive('/profile')}
		>
			<span class="material-symbols-outlined text-[20px] leading-none">person</span>
			<span class="text-[9px] font-black uppercase tracking-wider">Profile</span>
		</a>
	</nav>

	<!-- Floating Action Button (FAB) for Log Fuel -->
	{#if isActive('/log')}
		<a
			href="/dashboard"
			class="fab-btn shadow-lg active"
			title="Close Log"
			aria-label="Close Log"
		>
			<span class="material-symbols-outlined text-[24px] leading-none">add</span>
		</a>
	{:else}
		<a
			href="/log"
			class="fab-btn shadow-lg"
			title="Log Fuel"
			aria-label="Log Fuel"
		>
			<span class="material-symbols-outlined text-[24px] leading-none">add</span>
		</a>
	{/if}
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
	.fab-btn {
		position: fixed;
		bottom: 6rem;
		right: 1.5rem;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 9999px;
		background-color: var(--color-calories);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 10px 25px -5px color-mix(in oklch, var(--color-calories) 40%, transparent),
					0 8px 10px -6px color-mix(in oklch, var(--color-calories) 30%, transparent);
		z-index: 50;
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	.fab-btn:hover {
		transform: scale(1.1);
		box-shadow: 0 12px 30px -5px color-mix(in oklch, var(--color-calories) 50%, transparent);
	}
	.fab-btn:active {
		transform: scale(0.95);
	}
	.fab-btn.active .material-symbols-outlined {
		transform: rotate(45deg);
	}
	.fab-btn .material-symbols-outlined {
		transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@media (min-width: 480px) {
		.fab-btn {
			right: calc(50% - 224px + 1.5rem);
		}
	}
</style>
