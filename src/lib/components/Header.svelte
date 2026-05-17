<script lang="ts">
	import { auth } from "$lib/user.svelte";
	import { page } from "$app/state";

	const currentPath = $derived(page.url.pathname);
	const isActive = (path: string) =>
		currentPath === path || currentPath.startsWith(path + "/");
</script>

<nav
	class="flex justify-between items-center px-6 py-6 max-w-6xl mx-auto w-full"
>
	<a
		href="/"
		class="flex items-center gap-2 hover:opacity-80 transition-opacity group"
	>
		<div
			class="w-8 h-8 rounded-lg bg-[var(--color-calories)] flex items-center justify-center group-hover:scale-110 transition-transform"
		>
			<span class="text-[var(--color-surface)] font-black text-xl">F</span
			>
		</div>
		<span class="font-black text-xl tracking-tighter">Food Factor</span>
	</a>

	<div class="flex items-center gap-2 sm:gap-6">
		{#if auth.isValid}
			<a
				href="/dashboard"
				class="font-bold text-sm transition-colors {isActive(
					'/dashboard',
				)
					? 'text-[var(--color-calories)]'
					: 'hover:text-[var(--color-calories)]'}"
			>
				Dashboard
			</a>
			<a
				href="/profile"
				class="font-bold text-sm transition-colors {isActive('/profile')
					? 'text-[var(--color-calories)]'
					: 'hover:text-[var(--color-calories)]'}"
			>
				Profile
			</a>
		{:else}
			<a
				href="/login"
				class="font-bold text-sm transition-colors {isActive('/login')
					? 'text-[var(--color-calories)]'
					: 'hover:text-[var(--color-calories)]'}"
			>
				Log in
			</a>
			<a
				href="/signup"
				class="px-5 py-2 rounded-full bg-[var(--fg)] text-[var(--bg)] font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/5"
			>
				Sign up
			</a>
		{/if}
	</div>
</nav>
