<script lang="ts">
	import Footer from "$lib/components/Footer.svelte";
	// Privacy page: 100% private, local-only calorie tracker
</script>

<svelte:head>
	<title>Privacy Policy | Calzap</title>
	<meta
		name="description"
		content="Calzap is a 100% private, offline-only calorie tracker. I collect absolutely zero personal data. Read my simple privacy policy."
	/>
</svelte:head>

<div class="min-h-screen flex flex-col overflow-x-hidden relative bg-(--bg) text-(--fg)">
	<!-- Soft Ambient Glow -->
	<div
		class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[oklch(from_var(--color-calories)_l_c_h/0.03)] blur-[120px] pointer-events-none"
	></div>
	<div
		class="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[oklch(from_var(--color-protein)_l_c_h/0.02)] blur-[120px] pointer-events-none"
	></div>

	<main class="grow w-full max-w-3xl mx-auto px-6 py-16 md:py-24 flex flex-col items-start gap-10 relative z-10">
		<!-- Back to Home Arrow Link -->
		<a
			href="/"
			class="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-muted hover:text-(--fg) transition-colors group select-none focus:outline-hidden"
			id="privacy-back-button"
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
				class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[oklch(from_var(--color-protein)_l_c_h/0.08)] text-protein text-[10px] font-black uppercase tracking-wider border border-[oklch(from_var(--color-protein)_l_c_h/0.15)] select-none"
			>
				Strict Data Isolation.
			</div>
			<h1
				class="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1] text-balance"
			>
				Your diet is your business.
			</h1>
			<p class="text-base sm:text-lg text-muted font-medium leading-relaxed max-w-[65ch]">
				I believe privacy isn't a premium feature—it should be the default. Calzap is designed so that your personal logs never touch an external server.
			</p>
		</div>

		<!-- Horizontal separator -->
		<hr class="w-full border-(--border)" />

		<!-- Privacy Editorial Layout -->
		<div class="flex flex-col gap-12 w-full text-base sm:text-lg leading-relaxed font-medium text-muted">
			
			<!-- Section 1 -->
			<section class="flex flex-col gap-3.5 items-start">
				<div class="text-[10px] font-black tracking-widest text-calories uppercase select-none">
					01. Zero Collection
				</div>
				<h2 class="text-2xl font-black text-(--fg) tracking-tight">
					I collect absolutely nothing.
				</h2>
				<p>
					I do not collect, view, share, or sell your personal details. Since there are no sign-ups or user profiles stored in a cloud database, I literally have no access to your email, name, location, or food history. Your logs are completely blind to me.
				</p>
			</section>

			<!-- Section 2 -->
			<section class="flex flex-col gap-3.5 items-start">
				<div class="text-[10px] font-black tracking-widest text-protein uppercase select-none">
					02. Local Sandbox
				</div>
				<h2 class="text-2xl font-black text-(--fg) tracking-tight">
					Where does your data live?
				</h2>
				<p>
					All your weight logs, foods, settings, and macronutrient histories reside inside your web browser’s private sandbox database. This database operates entirely on your physical phone, laptop, or tablet. The files never travel across the internet to my servers.
				</p>
			</section>

			<!-- Section 3 -->
			<section class="flex flex-col gap-3.5 items-start">
				<div class="text-[10px] font-black tracking-widest text-carbs uppercase select-none">
					03. Third-party trackers
				</div>
				<h2 class="text-2xl font-black text-(--fg) tracking-tight">
					Zero ad trackers or analytics.
				</h2>
				<p>
					Most health apps use tracking scripts to monitor your screen clicks, body measurements, and dietary details. I find this invasive. Calzap contains zero Facebook trackers, zero Google Analytics, and zero advertising cookies. It is pure, quiet, and fast utility.
				</p>
			</section>

			<!-- Section 4 -->
			<section class="flex flex-col gap-3.5 items-start">
				<div class="text-[10px] font-black tracking-widest text-fats uppercase select-none">
					04. Absolute control
				</div>
				<h2 class="text-2xl font-black text-(--fg) tracking-tight">
					Total deletion is in your hands.
				</h2>
				<p>
					Because all data is on your device, you have total control over it. You can instantly wipe out all your logs by clicking "Reset Log" on the dashboard, resetting your profile settings, or by simply clearing your browser history. No awkward support requests needed.
				</p>
			</section>

			<!-- Section 5 -->
			<section class="flex flex-col gap-3.5 items-start">
				<div class="text-[10px] font-black tracking-widest text-fiber uppercase select-none">
					05. Optional AI Requests
				</div>
				<h2 class="text-2xl font-black text-(--fg) tracking-tight">
					How AI data is processed.
				</h2>
				<p>
					Calzap has an optional feature that lets you log foods by typing a conversational description. If you choose to use this tool, your natural language meal description is sent directly to the selected AI provider to translate into calorie/macro numbers. While I do not collect, store, or tag your AI requests with personal identifiers (such as an email or user profile), the text requests are processed in real-time under the privacy guidelines and policies of the respective AI developer platform.
				</p>
			</section>

		</div>

		<!-- Footer CTA -->
		<div class="w-full flex flex-col items-center justify-center pt-8 border-t border-(--border) mt-6 text-center gap-6">
			<p class="text-xs text-muted font-bold">
				Your privacy is mathematically absolute. Verify my open-source privacy code directly on <a href="https://github.com/gurbaxani/calzap" target="_blank" rel="noopener noreferrer" class="underline hover:text-protein transition-colors">GitHub</a>.
			</p>
			<a
				href="/"
				class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-(--fg) text-(--bg) font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-black/5"
				id="privacy-footer-home"
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
