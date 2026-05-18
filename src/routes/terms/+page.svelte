<script lang="ts">
	import Footer from "$lib/components/Footer.svelte";
	// Terms page: 100% private, local-only calorie tracker
</script>

<svelte:head>
	<title>Terms of Service | Calzap</title>
	<meta
		name="description"
		content="Read Calzap's simple, jargon-free Terms of Service. Absolute privacy, local calorie tracking, and 100% ownership of your nutrition data."
	/>
</svelte:head>

<div class="min-h-screen flex flex-col overflow-x-hidden relative bg-(--bg) text-(--fg)">
	<!-- Soft Ambient Glow -->
	<div
		class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[oklch(from_var(--color-calories)_l_c_h/0.03)] blur-[120px] pointer-events-none"
	></div>
	<div
		class="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[oklch(from_var(--color-fiber)_l_c_h/0.02)] blur-[120px] pointer-events-none"
	></div>

	<main class="grow w-full max-w-3xl mx-auto px-6 py-16 md:py-24 flex flex-col items-start gap-10 relative z-10">
		<!-- Back to Home Arrow Link -->
		<a
			href="/"
			class="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-muted hover:text-(--fg) transition-colors group select-none focus:outline-hidden"
			id="terms-back-button"
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
				class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[oklch(from_var(--color-calories)_l_c_h/0.08)] text-calories text-[10px] font-black uppercase tracking-wider border border-[oklch(from_var(--color-calories)_l_c_h/0.15)] select-none"
			>
				No Jargon. Simple Truths.
			</div>
			<h1
				class="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1] text-balance"
			>
				The Calzap Handshake.
			</h1>
			<p class="text-base sm:text-lg text-muted font-medium leading-relaxed max-w-[65ch]">
				Calzap is a local-only app built out of goodwill. These terms are written in plain, straightforward English so you know exactly how Calzap works and what to expect.
			</p>
		</div>

		<!-- Horizontal separator -->
		<hr class="w-full border-(--border)" />

		<!-- Terms Editorial Layout -->
		<div class="flex flex-col gap-12 w-full text-base sm:text-lg leading-relaxed font-medium text-muted">
			
			<!-- Section 1 -->
			<section class="flex flex-col gap-3.5 items-start">
				<div class="text-[10px] font-black tracking-widest text-calories uppercase select-none">
					01. Absolute Privacy
				</div>
				<h2 class="text-2xl font-black text-(--fg) tracking-tight">
					Your data stays on your device.
				</h2>
				<p>
					Everything you search, log, edit, or configure inside Calzap is saved directly onto your device (using your browser’s local storage). I do not run databases in the sky, I do not require user accounts, and I do not track your behavior. Your data belongs strictly to you.
				</p>
			</section>

			<!-- Section 2 -->
			<section class="flex flex-col gap-3.5 items-start">
				<div class="text-[10px] font-black tracking-widest text-protein uppercase select-none">
					02. Free Software
				</div>
				<h2 class="text-2xl font-black text-(--fg) tracking-tight">
					100% Free. Forever.
				</h2>
				<p>
					Calzap is entirely free to use. There are no corporate tracking cookies, no pop-up advertisements, and no hidden monthly subscriptions. I have no interest in making a profit from your nutrition tracker.
				</p>
			</section>

			<!-- Section 3 -->
			<section class="flex flex-col gap-3.5 items-start">
				<div class="text-[10px] font-black tracking-widest text-carbs uppercase select-none">
					03. Lifter's Disclaimer
				</div>
				<h2 class="text-2xl font-black text-(--fg) tracking-tight">
					I am a developer, not a doctor.
				</h2>
				<p>
					Calzap is a digital calculator designed to help you track food metrics. I make no medical claims, nor do I guarantee specific fitness or health results. Please consult a qualified nutritionist, physician, or fitness professional before making any significant changes to your nutrition or training.
				</p>
			</section>

			<!-- Section 4 -->
			<section class="flex flex-col gap-3.5 items-start">
				<div class="text-[10px] font-black tracking-widest text-fats uppercase select-none">
					04. Backup Responsibility
				</div>
				<h2 class="text-2xl font-black text-(--fg) tracking-tight">
					You are in charge of your backups.
				</h2>
				<p>
					Because all your data is stored locally inside your browser, cleaning your browser history, deleting temporary files, or swapping devices will delete your food log history. I provide a very simple <strong>Backup</strong> export tool in your profile. Please make sure to download backups regularly to protect your history.
				</p>
			</section>

			<!-- Section 5 -->
			<section class="flex flex-col gap-3.5 items-start">
				<div class="text-[10px] font-black tracking-widest text-fiber uppercase select-none">
					05. Open & Modifiable
				</div>
				<h2 class="text-2xl font-black text-(--fg) tracking-tight">
					Open software for public good.
				</h2>
				<p>
					Calzap is completely open-source under the AGPL-3.0 copyleft license. You are entirely free to self-host, clone, modify, and build upon this application. I only request that you respect the open and private spirit in which it was created.
				</p>
			</section>

			<!-- Section 6 -->
			<section class="flex flex-col gap-3.5 items-start">
				<div class="text-[10px] font-black tracking-widest text-calories uppercase select-none">
					06. Optional AI Assistant
				</div>
				<h2 class="text-2xl font-black text-(--fg) tracking-tight">
					AI estimations can be wrong.
				</h2>
				<p>
					Calzap includes an optional AI-powered natural language logger designed to help you quickly estimate calories and macronutrients from meal descriptions. Please remember that generative AI model estimations can be inaccurate, incomplete, or completely incorrect. Always review and correct your logged macros manually. If you choose to enable this integration, your food descriptions will be sent directly to the AI service provider and are governed by their respective platform policies.
				</p>
			</section>

		</div>

		<!-- Footer CTA -->
		<div class="w-full flex flex-col items-center justify-center pt-8 border-t border-(--border) mt-6 text-center gap-6">
			<p class="text-xs text-muted font-bold">
				Got questions or want to build upon Calzap? Feel free to check out the <a href="https://github.com/gurbaxani/calzap" target="_blank" rel="noopener noreferrer" class="underline hover:text-calories transition-colors">codebase on GitHub</a>!
			</p>
			<a
				href="/"
				class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-(--fg) text-(--bg) font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-black/5"
				id="terms-footer-home"
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
