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
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
				<polyline points="16 17 21 12 16 7"/>
				<line x1="21" y1="12" x2="9" y2="12"/>
			</svg>
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
						<svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
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
