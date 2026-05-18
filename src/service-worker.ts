/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, prerendered, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	...build,       // SvelteKit built JS/CSS files
	...files,       // Everything in the `static` directory
	...prerendered  // Statically prerendered HTML routes
];

self.addEventListener('install', (event) => {
	// Eagerly cache all static assets, built JS/CSS, and prerendered routes
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	// Clean up old caches from disk when a new service worker takes over
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) {
				await caches.delete(key);
			}
		}
	}

	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
	// Only intercept GET requests
	if (event.request.method !== 'GET') return;

	async function respond(): Promise<Response> {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// 1. Check if the asset is in our statically precached list
		const pathname = url.pathname;
		const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

		const isAsset = ASSETS.some((asset) => {
			if (asset === pathname || asset === normalizedPathname) return true;
			const normalizedAsset = asset.endsWith('/') ? asset.slice(0, -1) : asset;
			return normalizedAsset === normalizedPathname;
		});

		if (isAsset) {
			const matched = await cache.match(pathname) || 
			                await cache.match(normalizedPathname) || 
			                await cache.match(pathname + '/');
			
			if (matched) {
				return matched;
			}
		}

		// 2. Try network first, falling back to cache if offline
		try {
			const response = await fetch(event.request);

			if (!(response instanceof Response)) {
				throw new Error('invalid response from fetch');
			}

			// Don't cache dynamic API responses, external resources, or error states
			if (
				response.status === 200 && 
				url.origin === self.location.origin && 
				!response.headers.get('cache-control')?.includes('no-store')
			) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (err) {
			// Fallback: search cache for dynamic requests
			const response = await cache.match(event.request);
			if (response) {
				return response;
			}

			// For navigations (HTML pages), if we're completely offline and don't have the specific page,
			// we can serve the main page (index.html) as a fallback so the SPA client router can take over.
			if (event.request.mode === 'navigate') {
				const fallbackResponse = await cache.match('/');
				if (fallbackResponse) {
					return fallbackResponse;
				}
			}

			throw err;
		}
	}

	event.respondWith(respond());
});
