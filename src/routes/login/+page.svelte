<script lang="ts">
	import { pb } from '$lib/pb';
	import { goto } from '$app/navigation';
	import { ClientResponseError } from 'pocketbase';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);

	const isFormValid = $derived(
		email.includes('@') && 
		password.length > 0 && 
		!loading
	);

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		if (!isFormValid) return;

		loading = true;
		error = null;

		try {
			// Authenticate with PocketBase
			await pb.collection('users').authWithPassword(email, password);
			
			// Redirect to the dashboard upon success
			await goto('/dashboard');
		} catch (err) {
			if (err instanceof ClientResponseError) {
				// PocketBase specific error handling
				error = err.data?.message || err.message || 'Login failed. Please check your credentials.';
			} else if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'An unexpected error occurred';
			}
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Log In | Food App</title>
	<meta name="description" content="Log in to your account to track your nutrition." />
</svelte:head>

<main class="min-h-screen flex items-center justify-center p-4 bg-background">
	<div class="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-sm">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
			<p class="text-text-muted">Enter your credentials to access your account</p>
		</div>

		<form onsubmit={handleLogin} class="space-y-4">
			{#if error}
				<div class="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg" id="error-message">
					{error}
				</div>
			{/if}

			<div class="space-y-1.5">
				<label for="email" class="text-sm font-medium">Email address</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					placeholder="you@example.com"
					required
					class="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-calories/30 focus:border-calories/50 transition-all outline-hidden"
				/>
			</div>

			<div class="space-y-1.5">
				<div class="flex items-center justify-between">
					<label for="password" class="text-sm font-medium">Password</label>
				</div>
				<input
					type="password"
					id="password"
					bind:value={password}
					placeholder="••••••••"
					required
					class="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-calories/30 focus:border-calories/50 transition-all outline-hidden"
				/>
			</div>

			<button
				type="submit"
				disabled={!isFormValid}
				class="w-full py-3 px-4 bg-calories text-white font-semibold rounded-xl hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4 cursor-pointer"
			>
				{#if loading}
					<span class="inline-flex items-center gap-2">
						<svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Logging in...
					</span>
				{:else}
					Log in
				{/if}
			</button>
		</form>

		<div class="mt-8 text-center text-sm">
			<span class="text-text-muted">Don't have an account?</span>
			<a href="/signup" class="font-semibold text-calories hover:underline ml-1">Sign up</a>
		</div>
	</div>
</main>
