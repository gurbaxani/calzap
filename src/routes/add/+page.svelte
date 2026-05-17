<script lang="ts">
	import { goto } from '$app/navigation';
	import { foodDraft } from '$lib/foodDraft.svelte';

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (foodDraft.name.trim()) {
			goto('/add/quantity');
		}
	}
</script>

<div class="mx-auto max-w-lg pb-12 pt-4 px-4 sm:px-6 md:pt-8">
	<header class="mb-8 flex items-center justify-between">
		<div class="flex flex-col gap-1">
			<h1 class="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
				Name Your Food
			</h1>
			<p class="text-sm text-zinc-500 dark:text-zinc-400">
				Step 1 of 3
			</p>
		</div>
	</header>

	<form onsubmit={handleSubmit} class="flex flex-col gap-6">
		<fieldset class="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
			<div class="flex flex-col gap-2">
				<label for="name" class="text-xs font-bold uppercase tracking-wider text-zinc-500">Food Name</label>
				<input
					type="text"
					id="name"
					bind:value={foodDraft.name}
					required
					autofocus
					placeholder="e.g. Boiled Rice"
					class="w-full border-b-2 border-zinc-200 bg-transparent py-3 text-3xl font-bold tracking-tight text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-700 dark:focus:border-zinc-50 transition-colors"
				/>
			</div>
		</fieldset>

		<div class="pt-4">
			<button
				type="submit"
				disabled={!foodDraft.name.trim()}
				class="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-4 text-lg font-bold text-white transition-all hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50/20 active:scale-[0.98]"
			>
				<span>Continue</span>
				<svg class="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
				</svg>
			</button>
		</div>
	</form>
</div>
