<script lang="ts">
	import { pb } from '$lib/pb';
	import { goto } from '$app/navigation';
	import { ClientResponseError } from 'pocketbase';
	import type { Create } from '../../../pocketbase-types';

	let email = $state('');
	let password = $state('');
	let passwordConfirm = $state('');
	let name = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);

	const isFormValid = $derived(
		email.includes('@') && 
		password.length >= 8 && 
		password === passwordConfirm &&
		!loading
	);

	async function handleSignup(e: SubmitEvent) {
		e.preventDefault();
		if (!isFormValid) return;

		loading = true;
		error = null;

		try {
			const data: Create<'users'> = {
				email,
				password,
				passwordConfirm,
				name,
				emailVisibility: true,
			};

			// Create the user record
			await pb.collection('users').create(data);
			
			// Automatically log in the user after successful signup
			await pb.collection('users').authWithPassword(email, password);
			
			// Redirect to the dashboard
			await goto('/dashboard');
		} catch (err) {
			if (err instanceof ClientResponseError) {
				// Handle PocketBase specific errors
				error = err.data?.message || err.message || 'Signup failed';
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
	<title>Sign Up | Food App</title>
	<meta name="description" content="Create your account to start tracking your nutrition." />
</svelte:head>

<main class="min-h-screen flex items-center justify-center p-4 bg-background">
	<div class="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-sm">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold tracking-tight mb-2">Create an account</h1>
			<p class="text-text-muted">Join us to start your nutrition journey</p>
		</div>

		<form onsubmit={handleSignup} class="space-y-4">
			{#if error}
				<div class="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg" id="error-message">
					{error}
				</div>
			{/if}

			<div class="space-y-1.5">
				<label for="name" class="text-sm font-medium">Full Name</label>
				<input
					type="text"
					id="name"
					bind:value={name}
					placeholder="John Doe"
					class="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-calories/30 focus:border-calories/50 transition-all outline-hidden"
				/>
			</div>

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
				<label for="password" class="text-sm font-medium">Password</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					placeholder="••••••••"
					required
					minlength="8"
					class="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-calories/30 focus:border-calories/50 transition-all outline-hidden"
				/>
			</div>

			<div class="space-y-1.5">
				<label for="passwordConfirm" class="text-sm font-medium">Confirm Password</label>
				<input
					type="password"
					id="passwordConfirm"
					bind:value={passwordConfirm}
					placeholder="••••••••"
					required
					minlength="8"
					class="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-calories/30 focus:border-calories/50 transition-all outline-hidden"
				/>
				{#if passwordConfirm && password !== passwordConfirm}
					<p class="text-xs text-red-500 mt-1">Passwords do not match</p>
				{/if}
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
						Creating account...
					</span>
				{:else}
					Create account
				{/if}
			</button>
		</form>

		<div class="mt-8 text-center text-sm">
			<span class="text-text-muted">Already have an account?</span>
			<a href="/login" class="font-semibold text-calories hover:underline ml-1">Log in</a>
		</div>
	</div>
</main>
