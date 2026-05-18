<script lang="ts">
	// High-fidelity premium footer for public routes
</script>

<footer class="w-full border-t border-(--border) bg-[oklch(from_var(--color-surface)_l_c_h/0.3)] backdrop-blur-md relative z-10 py-16 md:py-20 overflow-hidden">
	<!-- Subtle ambient glow inside footer -->
	<div class="absolute bottom-0 right-0 w-[30%] h-[50%] rounded-full bg-[oklch(from_var(--color-calories)_l_c_h/0.015)] blur-[100px] pointer-events-none"></div>
	<div class="absolute top-0 left-10 w-[20%] h-[40%] rounded-full bg-[oklch(from_var(--color-protein)_l_c_h/0.01)] blur-[80px] pointer-events-none"></div>

	<div class="max-w-7xl mx-auto px-6 flex flex-col gap-12 md:gap-16">
		<div class="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-start">
			
			<!-- Left: Branding & Tagline -->
			<div class="md:col-span-6 flex flex-col items-start gap-4">
				<a href="/" class="flex items-center gap-2.5 group focus:outline-hidden">
					<div class="w-8 h-8 rounded-lg bg-calories flex items-center justify-center text-white shadow-lg shadow-(--color-calories)/20 group-hover:scale-105 group-hover:rotate-6 transition-all duration-350">
						<span class="material-symbols-outlined text-[18px] select-none" style="font-variation-settings: 'FILL' 1;">bolt</span>
					</div>
					<span class="font-black text-lg tracking-tight select-none">Calzap</span>
				</a>
				<p class="text-sm font-semibold text-muted leading-relaxed max-w-[38ch]">
					High-fidelity, lightning-fast nutrition tracking. Built with love for lifters who value their time and absolute data privacy.
				</p>
				<a
					href="https://github.com/gurbaxani/calzap"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[oklch(from_var(--color-border)_l_c_h/0.1)] hover:bg-[oklch(from_var(--color-border)_l_c_h/0.2)] text-muted hover:text-(--fg) text-xs font-black transition-all hover:scale-[1.02] active:scale-[0.98] mt-1 select-none focus:outline-hidden border border-[oklch(from_var(--color-border)_l_c_h/0.15)]"
				>
					<span>View Codebase on GitHub</span>
					<span class="material-symbols-outlined text-[14px] leading-none">arrow_outward</span>
				</a>
			</div>

			<!-- Center/Right: Navigation Links (Asymmetric structure) -->
			<div class="md:col-span-6 grid grid-cols-2 gap-8 md:justify-items-end w-full">
				<!-- Column 1: Core App -->
				<div class="flex flex-col gap-4 items-start md:items-end">
					<h4 class="text-[10px] font-black uppercase tracking-widest text-calories select-none">
						Application
					</h4>
					<div class="flex flex-col gap-2.5 text-sm font-bold text-muted items-start md:items-end">
						<a href="/dashboard" class="hover:text-(--fg) transition hover:translate-x-0.5 md:hover:-translate-x-0.5 duration-200">Open Dashboard</a>
						<a href="/foods" class="hover:text-(--fg) transition hover:translate-x-0.5 md:hover:-translate-x-0.5 duration-200">Food Directory</a>
						<a href="/profile" class="hover:text-(--fg) transition hover:translate-x-0.5 md:hover:-translate-x-0.5 duration-200">Profile Settings</a>
					</div>
				</div>

				<!-- Column 2: Legal & Safety -->
				<div class="flex flex-col gap-4 items-start md:items-end">
					<h4 class="text-[10px] font-black uppercase tracking-widest text-protein select-none">
						Legal & Trust
					</h4>
					<div class="flex flex-col gap-2.5 text-sm font-bold text-muted items-start md:items-end">
						<a href="/terms" class="hover:text-(--fg) transition hover:translate-x-0.5 md:hover:-translate-x-0.5 duration-200">Terms of Service</a>
						<a href="/privacy" class="hover:text-(--fg) transition hover:translate-x-0.5 md:hover:-translate-x-0.5 duration-200">Privacy Policy</a>
						<a href="/cookies" class="hover:text-(--fg) transition hover:translate-x-0.5 md:hover:-translate-x-0.5 duration-200">Cookies Policy</a>
					</div>
				</div>
			</div>

		</div>

		<!-- Bottom copyright / legal details -->
		<div class="pt-8 border-t border-(--border) flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-bold text-muted">
			<div class="flex flex-col gap-1 items-start">
				<p>© {new Date().getFullYear()} Calzap by KH Systems Pvt Ltd. All rights reserved.</p>
				<p class="text-[11px] text-muted/60 font-semibold">
					Licensed under the <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer" class="underline hover:text-(--fg) transition-colors">GNU AGPL v3.0</a>. Source code available on <a href="https://github.com/gurbaxani/calzap" target="_blank" rel="noopener noreferrer" class="underline hover:text-(--fg) transition-colors">GitHub</a>.
				</p>
			</div>
			
			<div class="flex items-center gap-2 px-3 py-1 rounded-full bg-[oklch(from_var(--color-calories)_l_c_h/0.05)] border border-[oklch(from_var(--color-calories)_l_c_h/0.1)] text-calories text-[10px] uppercase font-black tracking-wider select-none">
				<span class="relative flex h-2 w-2 mr-1">
					<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-calories opacity-75"></span>
					<span class="relative inline-flex rounded-full h-2 w-2 bg-calories"></span>
				</span>
				100% Local-Only
			</div>
		</div>
	</div>
</footer>

<style>
	.text-muted {
		color: var(--color-text-muted);
	}
	
	h4 {
		font-family: var(--font-sans);
	}
</style>
