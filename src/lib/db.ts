import { browser } from '$app/environment';
import type { Food, FoodLog, UserStats } from './store.svelte';

class IndexedDBManager {
	private db: IDBDatabase | null = null;

	async init(): Promise<IDBDatabase> {
		if (this.db) return this.db;
		return new Promise((resolve, reject) => {
			const request = indexedDB.open('CalzapDB', 1);
			request.onupgradeneeded = () => {
				const database = request.result;
				if (!database.objectStoreNames.contains('foods')) {
					database.createObjectStore('foods', { keyPath: 'id' });
				}
				if (!database.objectStoreNames.contains('foodLogs')) {
					database.createObjectStore('foodLogs', { keyPath: 'id' });
				}
				if (!database.objectStoreNames.contains('userStats')) {
					database.createObjectStore('userStats');
				}
			};
			request.onsuccess = () => {
				this.db = request.result;
				resolve(request.result);
			};
			request.onerror = () => reject(request.error);
		});
	}

	async getFoods(): Promise<Food[]> {
		const database = await this.init();
		return new Promise((resolve, reject) => {
			const transaction = database.transaction('foods', 'readonly');
			const store = transaction.objectStore('foods');
			const request = store.getAll();
			request.onsuccess = () => resolve(request.result as Food[]);
			request.onerror = () => reject(request.error);
		});
	}

	async saveFoods(items: Food[]): Promise<void> {
		const database = await this.init();
		return new Promise((resolve, reject) => {
			const transaction = database.transaction('foods', 'readwrite');
			const store = transaction.objectStore('foods');
			const clearReq = store.clear();
			clearReq.onsuccess = () => {
				if (items.length === 0) {
					resolve();
					return;
				}
				let completed = 0;
				for (const item of items) {
					const putReq = store.put($state.snapshot(item));
					putReq.onsuccess = () => {
						completed++;
						if (completed === items.length) resolve();
					};
					putReq.onerror = () => reject(putReq.error);
				}
			};
			clearReq.onerror = () => reject(clearReq.error);
		});
	}

	async getFoodLogs(): Promise<FoodLog[]> {
		const database = await this.init();
		return new Promise((resolve, reject) => {
			const transaction = database.transaction('foodLogs', 'readonly');
			const store = transaction.objectStore('foodLogs');
			const request = store.getAll();
			request.onsuccess = () => resolve(request.result as FoodLog[]);
			request.onerror = () => reject(request.error);
		});
	}

	async saveFoodLogs(items: FoodLog[]): Promise<void> {
		const database = await this.init();
		return new Promise((resolve, reject) => {
			const transaction = database.transaction('foodLogs', 'readwrite');
			const store = transaction.objectStore('foodLogs');
			const clearReq = store.clear();
			clearReq.onsuccess = () => {
				if (items.length === 0) {
					resolve();
					return;
				}
				let completed = 0;
				for (const item of items) {
					const putReq = store.put($state.snapshot(item));
					putReq.onsuccess = () => {
						completed++;
						if (completed === items.length) resolve();
					};
					putReq.onerror = () => reject(putReq.error);
				}
			};
			clearReq.onerror = () => reject(clearReq.error);
		});
	}

	async getUserStats(): Promise<UserStats | null> {
		const database = await this.init();
		return new Promise((resolve, reject) => {
			const transaction = database.transaction('userStats', 'readonly');
			const store = transaction.objectStore('userStats');
			const request = store.get('current');
			request.onsuccess = () => resolve((request.result as UserStats) || null);
			request.onerror = () => reject(request.error);
		});
	}

	async saveUserStats(stats: UserStats): Promise<void> {
		const database = await this.init();
		return new Promise((resolve, reject) => {
			const transaction = database.transaction('userStats', 'readwrite');
			const store = transaction.objectStore('userStats');
			const request = store.put($state.snapshot(stats), 'current');
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async clearAll(): Promise<void> {
		const database = await this.init();
		return new Promise((resolve, reject) => {
			const transaction = database.transaction(['foods', 'foodLogs', 'userStats'], 'readwrite');
			const foodsStore = transaction.objectStore('foods');
			const logsStore = transaction.objectStore('foodLogs');
			const statsStore = transaction.objectStore('userStats');

			foodsStore.clear();
			logsStore.clear();
			statsStore.clear();

			transaction.oncomplete = () => resolve();
			transaction.onerror = () => reject(transaction.error);
		});
	}
}

export const dbManager = browser ? new IndexedDBManager() : null;
