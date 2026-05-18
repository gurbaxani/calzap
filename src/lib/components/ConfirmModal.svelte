<script lang="ts">
	interface Props {
		isOpen: boolean;
		title: string;
		message: string;
		onConfirm: () => void;
		onCancel: () => void;
	}

	let { isOpen, title, message, onConfirm, onCancel }: Props = $props();
</script>

{#if isOpen}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			type="button"
			onclick={onCancel}
			class="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs transition-opacity duration-300 w-full h-full border-0 cursor-pointer"
			aria-label="Close modal"
		></button>

		<!-- Modal Container -->
		<div class="relative bg-(--surface) border border-(--border) w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 fade-in duration-200">
			<!-- Close Button -->
			<button
				type="button"
				onclick={onCancel}
				class="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:opacity-80 transition-opacity cursor-pointer"
				aria-label="Cancel"
			>
				✕
			</button>

			<div class="flex flex-col gap-2">
				<h3 class="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
					{title}
				</h3>
				<p class="text-sm text-zinc-500 dark:text-zinc-400 leading-normal">
					{message}
				</p>
			</div>

			<div class="flex gap-3 w-full mt-2">
				<button
					type="button"
					onclick={onCancel}
					class="flex-1 py-3 px-4 rounded-xl border border-(--border) text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={onConfirm}
					class="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
				>
					Delete
				</button>
			</div>
		</div>
	</div>
{/if}
