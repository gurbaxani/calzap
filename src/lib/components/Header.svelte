<script lang="ts">
	import { page } from "$app/state";

	const currentPath = $derived(page.url.pathname);
	const isActive = (path: string) =>
		currentPath === path || currentPath.startsWith(path + "/");
</script>

<!-- Add body padding to ensure content scrolling past fixed bottom dock -->
{#if currentPath !== "/"}
	<style>
		body {
			padding-bottom: 7rem !important;
		}
	</style>
{/if}

{#if currentPath === "/"}
	<header
		class="sticky top-0 z-40 w-full border-b border-(--border) bg-(--bg)/80 backdrop-blur-md transition-all duration-300"
	>
		<div
			class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between"
		>
			<!-- Left: Stunning Logo -->
			<a
				href="/"
				class="flex items-center gap-2.5 group focus:outline-hidden"
			>
				<div
					class="w-9 h-9 rounded-xl bg-calories flex items-center justify-center text-white shadow-lg shadow-(--color-calories)/20 group-hover:scale-105 group-hover:rotate-6 transition-all duration-350"
				>
					<span
						class="material-symbols-outlined text-[20px] select-none"
						style="font-variation-settings: 'FILL' 1;"
						>bolt</span
					>
				</div>
				<span class="font-black text-xl tracking-tight select-none"
					>Calzap</span
				>
			</a>

			<!-- Center: Scroll Anchors for desktop -->
			<nav
				class="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-wider text-muted"
			>
				<!-- Product Dropdown Menu -->
				<div class="relative group py-2">
					<button
						type="button"
						class="hover:text-(--fg) flex items-center gap-1 transition-colors cursor-pointer select-none py-2 text-[10px] font-black uppercase tracking-wider bg-transparent border-0 p-0"
					>
						<span>Product</span>
						<span class="material-symbols-outlined text-[14px] leading-none transition-transform duration-200 group-hover:rotate-180">keyboard_arrow_down</span>
					</button>

					<!-- Dropdown Submenu Container -->
					<div
						class="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-44 rounded-2xl bg-(--surface)/95 border border-(--border) p-2 shadow-2xl backdrop-blur-lg opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50 flex flex-col gap-1"
					>
						<a
							href="/#problem-solution-section"
							class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left hover:bg-[oklch(from_var(--border)_l_c_h/0.3)] transition-colors text-[9px] font-black uppercase tracking-wider text-muted hover:text-(--fg)"
						>
							<span class="material-symbols-outlined text-[16px] leading-none text-rose-500" style="font-variation-settings: 'FILL' 1;">error</span>
							<span>Problem</span>
						</a>
						<a
							href="/#benefits-section"
							class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left hover:bg-[oklch(from_var(--border)_l_c_h/0.3)] transition-colors text-[9px] font-black uppercase tracking-wider text-muted hover:text-(--fg)"
						>
							<span class="material-symbols-outlined text-[16px] leading-none text-carbs" style="font-variation-settings: 'FILL' 1;">check_circle</span>
							<span>Solution</span>
						</a>
						<a
							href="/#features-section"
							class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left hover:bg-[oklch(from_var(--border)_l_c_h/0.3)] transition-colors text-[9px] font-black uppercase tracking-wider text-muted hover:text-(--fg)"
						>
							<span class="material-symbols-outlined text-[16px] leading-none text-calories" style="font-variation-settings: 'FILL' 1;">bolt</span>
							<span>Features</span>
						</a>
					</div>
				</div>

				<!-- Pricing link -->
				<a
					href="/#pricing-section"
					class="hover:text-(--fg) relative py-2 transition-colors after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-calories after:opacity-0 hover:after:opacity-100 after:transition-opacity duration-200"
					>Pricing</a
				>

				<!-- FAQs link -->
				<a
					href="/#faq-section"
					class="hover:text-(--fg) relative py-2 transition-colors after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-calories after:opacity-0 hover:after:opacity-100 after:transition-opacity duration-200"
					>FAQs</a
				>
			</nav>

			<!-- Right: CTA Links -->
			<div class="flex items-center gap-3">
				<a
					href="/dashboard"
					class="group px-6 py-3 rounded-2xl bg-calories text-white font-black text-xs uppercase tracking-widest hover:scale-[1.03] active:scale-[0.97] hover:shadow-lg hover:shadow-(--color-calories)/30 hover:bg-calories/90 transition-all flex items-center gap-2 shadow-md shadow-black/5"
				>
					<span>Open App</span>
					<span class="material-symbols-outlined text-[14px] leading-none transition-transform group-hover:translate-x-0.5 select-none" style="font-variation-settings: 'FILL' 1;">bolt</span>
				</a>
			</div>
		</div>
	</header>
{/if}

<!-- Floating Mobile Dock Nav Bar -->
{#if currentPath !== "/"}
	<nav
		class="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[320px] z-50 bg-(--surface)/90 backdrop-blur-md border border-(--border) rounded-3xl p-2 shadow-2xl flex items-center justify-between dock-nav"
	>
		<!-- Dashboard Tab -->
		<a
			href="/dashboard"
			class="flex flex-col items-center justify-center gap-1 w-[72px] py-2 rounded-2xl transition-all navigation-tab"
			class:active={isActive("/dashboard")}
		>
			<span class="material-symbols-outlined text-[20px] leading-none"
				>home</span
			>
			<span class="text-[9px] font-black uppercase tracking-wider"
				>Home</span
			>
		</a>

		<!-- Add Food Tab -->
		<a
			href="/foods"
			class="flex flex-col items-center justify-center gap-1 w-[72px] py-2 rounded-2xl transition-all navigation-tab"
			class:active={isActive("/foods")}
		>
			<span class="material-symbols-outlined text-[20px] leading-none"
				>restaurant</span
			>
			<span class="text-[9px] font-black uppercase tracking-wider"
				>Foods</span
			>
		</a>

		<!-- Profile Tab -->
		<a
			href="/profile"
			class="flex flex-col items-center justify-center gap-1 w-[72px] py-2 rounded-2xl transition-all navigation-tab"
			class:active={isActive("/profile")}
		>
			<span class="material-symbols-outlined text-[20px] leading-none"
				>person</span
			>
			<span class="text-[9px] font-black uppercase tracking-wider"
				>Profile</span
			>
		</a>
	</nav>

	<!-- Floating Action Button (FAB) for Log Macros -->
	{#if isActive("/log")}
		<a
			href="/dashboard"
			class="fab-btn active"
			title="Close Log"
			aria-label="Close Log"
		>
			<span class="material-symbols-outlined text-[24px] leading-none"
				>add</span
			>
		</a>
	{:else}
		<a
			href="/log"
			class="fab-btn"
			title="Log Macros"
			aria-label="Log Macros"
		>
			<span class="material-symbols-outlined text-[24px] leading-none"
				>add</span
			>
		</a>
	{/if}
{/if}

<style>
	.text-muted {
		color: var(--color-text-muted);
	}

	/* Sticky header styling */
	header {
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
	}

	/* Dock styling */
	.dock-nav {
		box-shadow:
			0 20px 40px -15px rgba(0, 0, 0, 0.25),
			inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
	}
	:global(.light) .dock-nav {
		box-shadow:
			0 20px 40px -15px rgba(0, 0, 0, 0.08),
			inset 0 1px 0 0 rgba(255, 255, 255, 0.4);
	}

	.navigation-tab {
		color: var(--color-text-muted);
		position: relative;
		transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
	}

	.navigation-tab:hover {
		color: var(--color-text);
	}

	.navigation-tab.active {
		color: var(--color-calories);
		transform: translateY(-1px);
	}

	.navigation-tab.active .material-symbols-outlined {
		font-variation-settings:
			"FILL" 1,
			"wght" 400,
			"GRAD" 0,
			"opsz" 20;
	}

	/* Micro active indicator */
	.navigation-tab::after {
		content: "";
		position: absolute;
		bottom: 2px;
		left: 50%;
		transform: translateX(-50%) scale(0);
		width: 3px;
		height: 3px;
		border-radius: 9999px;
		background-color: var(--color-calories);
		opacity: 0;
		transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.navigation-tab.active::after {
		opacity: 1;
		transform: translateX(-50%) scale(1);
	}

	/* premium FAB styles */
	.fab-btn {
		position: fixed;
		bottom: 6rem;
		right: 1.5rem;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 9999px;
		background-color: var(--color-calories);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow:
			0 10px 25px -5px color-mix(in oklch, var(--color-calories) 40%, transparent),
			0 8px 10px -6px color-mix(in oklch, var(--color-calories) 30%, transparent);
		z-index: 50;
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.fab-btn:hover {
		transform: scale(1.08);
		box-shadow: 0 12px 30px -5px color-mix(in oklch, var(--color-calories)
					50%, transparent);
	}

	.fab-btn:active {
		transform: scale(0.95);
	}

	.fab-btn.active {
		background-color: var(--fg);
		color: var(--bg);
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25);
	}

	.fab-btn.active .material-symbols-outlined {
		transform: rotate(45deg);
	}

	.fab-btn .material-symbols-outlined {
		transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@media (min-width: 480px) {
		.fab-btn {
			right: calc(50% - 224px + 1.5rem);
		}
	}
</style>
