<script lang="ts">
	// Food Factor Landing Page - Updated
</script>

<svelte:head>
	<title>Food Factor | Utility-First Macro Tracking</title>
	<meta name="description" content="Track your calories and macros in under 10 seconds. No bloat, no ads, just high-performance data tracking for gym-goers and fitness enthusiasts." />
</svelte:head>

<div class="min-h-screen flex flex-col overflow-x-hidden">
	<!-- Navigation -->
	<nav class="flex justify-between items-center px-6 py-8 max-w-6xl mx-auto w-full">
		<div class="flex items-center gap-2">
			<div class="w-8 h-8 rounded-lg bg-[var(--color-calories)] flex items-center justify-center">
				<span class="text-[var(--color-surface)] font-black text-xl">F</span>
			</div>
			<span class="font-black text-xl tracking-tighter">Food Factor</span>
		</div>
		<a 
			href="/dashboard" 
			class="px-5 py-2 rounded-full bg-[var(--color-surface)] border border-[var(--border)] font-bold text-sm hover:scale-105 transition-transform"
		>
			Open App
		</a>
	</nav>

	<!-- Hero Section -->
	<main class="flex-grow flex flex-col items-center justify-center px-6 py-20 text-center max-w-4xl mx-auto">
		<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-calories)]/10 text-[var(--color-calories)] text-xs font-bold uppercase tracking-widest mb-8">
			<span class="relative flex h-2 w-2">
				<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-calories)] opacity-75"></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-calories)]"></span>
			</span>
			Performance Grade Utility
		</div>

		<h1 class="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 text-balance">
			Log your fuel in <span class="text-[var(--color-calories)]">seconds</span>, not minutes.
		</h1>
		
		<p class="text-xl md:text-2xl text-muted max-w-2xl mb-12 font-medium leading-relaxed">
			Food Factor is the hyper-focused macro tracker for those who value speed and precision. No newsfeeds. No ads. No bloat.
		</p>

		<div class="flex flex-col sm:flex-row gap-4 w-full max-w-md">
			<a 
				href="/dashboard" 
				class="flex-1 py-4 px-8 rounded-2xl bg-[var(--fg)] text-[var(--bg)] font-bold text-xl shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center"
			>
				Start Tracking
			</a>
		</div>
	</main>

	<!-- Features Grid -->
	<section class="grid md:grid-cols-3 gap-12 px-6 py-24 max-w-6xl mx-auto w-full">
		<div class="flex flex-col gap-4">
			<div class="w-12 h-12 rounded-2xl bg-[var(--color-protein)]/10 flex items-center justify-center text-[var(--color-protein)]">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
			</div>
			<h3 class="text-xl font-bold tracking-tight">Pure Utility</h3>
			<p class="text-muted leading-relaxed font-medium">Focused entirely on the 5 core metrics that matter: Calories, Protein, Carbs, Fats, and Fiber.</p>
		</div>
		
		<div class="flex flex-col gap-4">
			<div class="w-12 h-12 rounded-2xl bg-[var(--color-carbs)]/10 flex items-center justify-center text-[var(--color-carbs)]">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
			</div>
			<h3 class="text-xl font-bold tracking-tight">10-Second Entry</h3>
			<p class="text-muted leading-relaxed font-medium">Engineered for high-frequency, low-duration sessions. Log your meal and get back to your day.</p>
		</div>

		<div class="flex flex-col gap-4">
			<div class="w-12 h-12 rounded-2xl bg-[var(--color-fats)]/10 flex items-center justify-center text-[var(--color-fats)]">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
			</div>
			<h3 class="text-xl font-bold tracking-tight">Privacy First</h3>
			<p class="text-muted leading-relaxed font-medium">Your data stays yours. No tracking pixels, no selling your habits to third-party advertisers.</p>
		</div>
	</section>

	<footer class="py-12 border-t border-[var(--border)] text-center">
		<p class="text-sm font-bold text-muted">© {new Date().getFullYear()} KH Systems Private Limited. All rights reserved.</p>
	</footer>
</div>

<style>
	.text-muted {
		color: var(--color-text-muted);
	}
	
	h1 {
		font-family: var(--font-sans);
	}
</style>
