<script lang="ts">
	import { auth } from '$lib/user.svelte';
	import { pb } from '$lib/pb';
</script>

<svelte:head>
	<title>Profile | Food Factor</title>
</svelte:head>

<main class="max-w-2xl mx-auto px-6 py-12">
	<header class="mb-12">
		<h1 class="text-4xl font-black tracking-tighter mb-2">Your Profile</h1>
		<p class="text-muted font-medium">Manage your account and preferences</p>
	</header>

	{#if auth.isValid && auth.user}
		<section class="grid gap-6">
			<div class="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
				<div class="flex items-center gap-6 mb-8">
					<div class="w-20 h-20 rounded-2xl bg-[var(--color-calories)] flex items-center justify-center text-white text-3xl font-black">
						{auth.user.email?.charAt(0).toUpperCase() || 'U'}
					</div>
					<div>
						<h2 class="text-2xl font-bold tracking-tight">{auth.user.name || 'User'}</h2>
						<p class="text-muted">{auth.user.email}</p>
					</div>
				</div>

				<div class="grid gap-4 py-6 border-t border-[var(--border)]">
					<div class="flex justify-between items-center">
						<span class="text-muted font-medium">Account ID</span>
						<span class="font-mono text-sm">{auth.user.id}</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-muted font-medium">Verified</span>
						<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold {auth.user.verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">
							{auth.user.verified ? 'Yes' : 'No'}
						</span>
					</div>
				</div>

				<div class="pt-6 border-t border-[var(--border)]">
					<a 
						href="/logout" 
						class="inline-flex items-center gap-2 text-red-500 font-bold hover:underline"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
						Sign out of all sessions
					</a>
				</div>
			</div>
		</section>
	{:else}
		<div class="text-center py-20 bg-[var(--surface)] rounded-3xl border border-[var(--border)] border-dashed">
			<h2 class="text-xl font-bold mb-4">Please log in to view your profile</h2>
			<a href="/login" class="px-8 py-3 rounded-xl bg-[var(--fg)] text-[var(--bg)] font-bold">Log In</a>
		</div>
	{/if}
</main>

<style>
	.text-muted {
		color: var(--color-text-muted);
	}
</style>
