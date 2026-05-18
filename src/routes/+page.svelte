<script lang="ts">
	// Food Factor Landing Page - Updated
</script>

<svelte:head>
	<title>Food Factor | Utility-First Macro Tracking</title>
	<meta name="description" content="Track your calories and macros in under 10 seconds. No bloat, no ads, just high-performance data tracking for gym-goers and fitness enthusiasts." />
</svelte:head>

<div class="min-h-screen flex flex-col overflow-x-hidden">
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
				<span class="material-symbols-outlined text-[24px] select-none">monitoring</span>
			</div>
			<h3 class="text-xl font-bold tracking-tight">Pure Utility</h3>
			<p class="text-muted leading-relaxed font-medium">Focused entirely on the 5 core metrics that matter: Calories, Protein, Carbs, Fats, and Fiber.</p>
		</div>
		
		<div class="flex flex-col gap-4">
			<div class="w-12 h-12 rounded-2xl bg-[var(--color-carbs)]/10 flex items-center justify-center text-[var(--color-carbs)]">
				<span class="material-symbols-outlined text-[24px] select-none">schedule</span>
			</div>
			<h3 class="text-xl font-bold tracking-tight">10-Second Entry</h3>
			<p class="text-muted leading-relaxed font-medium">Engineered for high-frequency, low-duration sessions. Log your meal and get back to your day.</p>
		</div>

		<div class="flex flex-col gap-4">
			<div class="w-12 h-12 rounded-2xl bg-[var(--color-fats)]/10 flex items-center justify-center text-[var(--color-fats)]">
				<span class="material-symbols-outlined text-[24px] select-none">shield</span>
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
