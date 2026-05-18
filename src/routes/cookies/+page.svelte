<script lang="ts">
	import Footer from "$lib/components/Footer.svelte";
	// Cookies page: 100% private, local-only calorie tracker
</script>

<svelte:head>
	<title>Cookies Policy | Calzap</title>
	<meta
		name="description"
		content="Calzap uses absolutely zero ad trackers or tracking cookies. Learn about the offline-only local browser storage technology."
	/>
</svelte:head>

<div class="min-h-screen flex flex-col overflow-x-hidden relative bg-(--bg) text-(--fg)">
	<!-- Soft Ambient Glow -->
	<div
		class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[oklch(from_var(--color-calories)_l_c_h/0.03)] blur-[120px] pointer-events-none"
	></div>
	<div
		class="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[oklch(from_var(--color-carbs)_l_c_h/0.02)] blur-[120px] pointer-events-none"
	></div>

	<main class="grow w-full max-w-3xl mx-auto px-6 py-16 md:py-24 flex flex-col items-start gap-10 relative z-10">
		<!-- Back to Home Arrow Link -->
		<a
			href="/"
			class="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-muted hover:text-(--fg) transition-colors group select-none focus:outline-hidden"
			id="cookies-back-button"
		>
			<span
				class="material-symbols-outlined text-[16px] leading-none transition-transform group-hover:-translate-x-1"
				>arrow_back</span
			>
			<span>Back to Home</span>
		</a>

		<!-- Header -->
		<div class="flex flex-col items-start gap-4">
			<div
				class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[oklch(from_var(--color-carbs)_l_c_h/0.08)] text-carbs text-[10px] font-black uppercase tracking-wider border border-[oklch(from_var(--color-carbs)_l_c_h/0.15)] select-none"
			>
				No Ad Tracking.
			</div>
			<h1
				class="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1] text-balance"
			>
				Zero tracking cookies.
			</h1>
			<p class="text-base sm:text-lg text-muted font-medium leading-relaxed max-w-[65ch]">
				I do not use standard advertising or session tracking cookies. Instead, I use local browser technology purely to keep the app working offline on your machine.
			</p>
		</div>

		<!-- Horizontal separator -->
		<hr class="w-full border-(--border)" />

		<!-- Cookies Editorial Layout -->
		<div class="flex flex-col gap-12 w-full text-base sm:text-lg leading-relaxed font-medium text-muted">
			
			<!-- Section 1 -->
			<section class="flex flex-col gap-3.5 items-start">
				<div class="text-[10px] font-black tracking-widest text-calories uppercase select-none">
					01. What are cookies?
				</div>
				<h2 class="text-2xl font-black text-(--fg) tracking-tight">
					Standard vs. Private Storage.
				</h2>
				<p>
					Cookies are small text files that websites send across the internet to track your session, remember who you are, or follow you around to show you targeted ads. Calzap does not have ads or online accounts, meaning I have absolutely no use for tracking cookies.
				</p>
			</section>

			<!-- Section 2 -->
			<section class="flex flex-col gap-3.5 items-start">
				<div class="text-[10px] font-black tracking-widest text-protein uppercase select-none">
					02. Local Tech
				</div>
				<h2 class="text-2xl font-black text-(--fg) tracking-tight">
					What does Calzap use instead?
				</h2>
				<p>
					To let you log your food and macros instantly without any lag, I store your logs directly on your own device. I use two highly secure browser storage tools:
				</p>
				<ul class="list-disc pl-6 flex flex-col gap-2.5 mt-1.5">
					<li>
						<strong>IndexedDB</strong>: A private, heavy-duty database inside your browser. I use it to save your daily food logs, weight measurements, and custom recipes.
					</li>
					<li>
						<strong>Local Storage</strong>: A smaller local memory pad. I use it to remember your daily macronutrient targets, your theme preference (dark or light mode), and dashboard settings.
					</li>
				</ul>
			</section>

			<!-- Section 3 -->
			<section class="flex flex-col gap-3.5 items-start">
				<div class="text-[10px] font-black tracking-widest text-carbs uppercase select-none">
					03. Security Sandbox
				</div>
				<h2 class="text-2xl font-black text-(--fg) tracking-tight">
					Total sandboxed security.
				</h2>
				<p>
					Your browser secures this data inside a sandbox. This means other websites you visit cannot read, steal, or modify your Calzap database. It is completely isolated and strictly visible to you on your machine.
				</p>
			</section>

			<!-- Section 4 -->
			<section class="flex flex-col gap-3.5 items-start">
				<div class="text-[10px] font-black tracking-widest text-fats uppercase select-none">
					04. How to manage it
				</div>
				<h2 class="text-2xl font-black text-(--fg) tracking-tight">
					Clearing your logs.
				</h2>
				<p>
					If you ever want to wipe out your database entirely, you can do it instantly through your browser settings. Simply clear "Cookies and Site Data" or delete "Cached storage" for this domain, and your browser will purge the database and restore a clean slate.
				</p>
			</section>

		</div>

		<!-- Footer CTA -->
		<div class="w-full flex flex-col items-center justify-center pt-8 border-t border-(--border) mt-6 text-center gap-6">
			<p class="text-xs text-muted font-bold">
				High-speed, offline-only calorie tracking built with absolute user agency. Inspect the code on <a href="https://github.com/gurbaxani/calzap" target="_blank" rel="noopener noreferrer" class="underline hover:text-carbs transition-colors">GitHub</a>.
			</p>
			<a
				href="/"
				class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-(--fg) text-(--bg) font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-black/5"
				id="cookies-footer-home"
			>
				Back to Main Landing
			</a>
		</div>
	</main>

	<Footer />
</div>

<style>
	.text-muted {
		color: var(--color-text-muted);
	}

	h1,
	h2 {
		font-family: var(--font-sans);
	}
</style>
