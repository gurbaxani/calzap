<script lang="ts">
	import { pb } from '$lib/pb';
	import { goto } from '$app/navigation';

	let loading = $state(false);

	async function handleLogout() {
		loading = true;
		try {
			// Clear the PocketBase auth store
			pb.authStore.clear();
			// Redirect to the login page
			await goto('/login');
		} catch (error) {
			console.error('Logout failed:', error);
		} finally {
			loading = false;
		}
	}

	function handleCancel() {
		// Go back to the previous page or dashboard
		if (window.history.length > 1) {
			history.back();
		} else {
			goto('/dashboard');
		}
	}
</script>

<svelte:head>
	<title>Log Out | Food App</title>
	<meta name="description" content="Confirm your logout from the Food App." />
</svelte:head>

<main class="min-h-screen flex items-center justify-center p-4 bg-background">
	<div class="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-sm text-center">
		<div 
			class="w-16 h-16 bg-calories/10 text-calories rounded-full flex items-center justify-center mx-auto mb-6"
			aria-hidden="true"
		>
			<span class="material-symbols-outlined text-[32px] select-none leading-none">logout</span>
		</div>

		<h1 class="text-2xl font-bold tracking-tight mb-2">Log Out</h1>
		<p class="text-text-muted mb-8">Are you sure you want to log out of your account? You will need to log back in to access your data.</p>

		<div class="flex flex-col gap-3">
			<button
				type="button"
				id="confirm-logout-btn"
				onclick={handleLogout}
				disabled={loading}
				class="w-full py-3 px-4 bg-calories text-white font-semibold rounded-xl hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer shadow-sm"
			>
				{#if loading}
					<span class="inline-flex items-center gap-2">
						<span class="material-symbols-outlined animate-spin text-[16px] leading-none select-none">sync</span>
						Logging out...
					</span>
				{:else}
					Yes, log out
				{/if}
			</button>
			
			<button
				type="button"
				id="cancel-logout-btn"
				onclick={handleCancel}
				disabled={loading}
				class="w-full py-3 px-4 bg-transparent text-text font-semibold rounded-xl border border-border hover:bg-background active:scale-[0.98] transition-all cursor-pointer"
			>
				Cancel
			</button>
		</div>
	</div>
</main>
