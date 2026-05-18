# ⚡ Calzap: High-Performance, Privacy-First Nutrient & Calorie Tracker

🔗 **Live Production App**: [calzap.ashwinig.com](https://calzap.ashwinig.com)

Calzap is an ultra-lightweight, offline-first, zero-bloat calorie and macronutrient tracking web application engineered with **Svelte 5 (Runes)**, **TypeScript**, and **Tailwind CSS v4**. 

Built for speed, efficiency, and data isolation, Calzap contains no ads, no trackers, no cloud accounts, and no paywalls. It allows athletes and lifters to track their core nutritional metrics—**Calories, Protein, Carbs, Fats, and Fiber**—in under 10 seconds. Calzap is designed to run entirely in the browser client with immediate responsiveness, utilizing local storage systems and secure, client-configured AI microservices.

---

## 🚀 Core Philosophy & Architecture

### 1. Local-First Data Isolation
Calzap strictly implements a **zero-server data isolation model**. There are no remote backends or centralized databases storing user intake histories. 
* All food catalogs, daily logs, target parameters, and settings are preserved in the user's browser client via a custom transactional **IndexedDB** wrapper (`src/lib/db.ts`).
* Provides 100% private, zero-latency tracking that functions seamlessly in basement gyms, offline environments, or flight modes.
* Enables complete manual control over user data with simple **JSON-based manual backups** and **CSV reporting** engines that run entirely client-side.

### 2. Svelte 5 Runes & Granular Reactivity
Calzap leverages the compiler-driven reactivity of Svelte 5 to eliminate virtual-DOM diffing overhead, resulting in immediate UI updates:
* **`$state`**: Manages mutable core arrays (e.g., catalog items, consumed history) and user configuration objects.
* **`$derived`**: Dynamically computes numerical calorie metrics, macro ratios, remaining budgets, active streaks, and statistical charts.
* **`$derived.by`**: Executes complex multi-step data reductions (e.g., aggregating monthly histories and generating O(N) daily calendar buckets) strictly on-demand.
* **`$props`**: Unpacks read-only configuration variables safely to sub-components with strict static typing.

### 3. The "Zero Side Effects" Rule
To prevent unpredictable rendering cycles, nested recalculation cascades, and Cumulative Layout Shifts (CLS), **the codebase strictly avoids `$effect`**. 
* Reactivity flows strictly in one direction from raw input state to derived data values.
* State transitions and IndexedDB synchronizations are triggered explicitly through event-driven user actions (e.g., `addFoodLog()`, `deleteFood()`, `updateUserStats()`) rather than side-effect hooks.

### 4. Tailwind CSS v4 & OKLCH Theme Engine
Calzap employs a modern typography and color pipeline optimized for raw readability under harsh gym lighting:
* Styled with **Tailwind CSS v4**'s unified `@theme` directive, implementing light/dark dark-mode adaptation via standard CSS media selectors.
* Core colors are mapped to high-contrast, mathematically precise **OKLCH color coordinates** in `src/routes/layout.css` to guarantee visual harmony and strict consistency:
  * 🔵 **Calories**: `oklch(0.62 0.18 250)` (Precise Sapphire Blue)
  * 🟠 **Protein**: `oklch(0.65 0.20 35)` (Vibrant Energy Orange)
  * 🟢 **Carbs**: `oklch(0.65 0.17 145)` (Crisp Vitality Green)
  * 🟡 **Fats**: `oklch(0.78 0.16 85)` (Rich Golden Yellow)
  * 🟣 **Fiber**: `oklch(0.62 0.16 310)` (Soft Grape Purple)

### 5. Client-Side AI Assistance (Gemini Integration)
Calzap features integrated AI-assisted macronutrient estimation:
* Leverages the Google AI Studio / **Gemini API** (`gemini-3-flash:generateContent`).
* **Execution Model**: While the actual model inference runs remotely on Google's cloud servers (fully powered by the user's custom Google AI Studio key), the integration is orchestrated directly from the user's browser client.
* **Completely Optional**: The AI estimation feature is entirely optional. Users do not need a Google AI Studio API key to use Calzap; they can manually enter all food names, quantities, and exact macronutrient counts at any time.
* **Absolute Privacy Guarantee**: If the AI estimation feature is not enabled (i.e., no API key is provided), **absolutely no information is transmitted anywhere**. The entire application operates in 100% local-offline mode, with all data calculations and storage self-contained purely on the user's physical device. If a key is added, only the raw meal description is queried securely to Google's endpoints directly from the browser, bypassing any application backends or telemetry trackers.

---

## 📂 Repository File Structure

```bash
/home/ashwini/code/food
├── .impeccable.md        # Style guidelines and design token requirements
├── svelte.config.js       # SvelteKit preprocessor & adapter configurations
├── vite.config.ts         # Vite bundler configurations & CSS compiler setup
├── tsconfig.json          # TypeScript strict path mapping and compiler settings
├── package.json           # Declarative app manifests & Vite/Svelte dependencies
├── static/                # Static assets (Favicons and manifest files)
└── src/
    ├── app.d.ts           # Global SvelteKit namespace types and declarations
    ├── app.html           # Baseline entry HTML layout & font import structures
    ├── lib/               # Shared utilities, components, and state systems
    │   ├── assets/        # Visual branding materials
    │   ├── db.ts          # Transactional client IndexedDB manager class
    │   ├── index.ts       # Shared libraries entry point
    │   ├── store.svelte.ts# Core reactive Svelte 5 state store
    │   ├── foodDraft.svelte.ts # Reactive buffer state for food creation wizard
    │   └── components/    # Reusable structural ui elements
    │       ├── Header.svelte   # Navigation layout & title headings
    │       ├── Footer.svelte   # Detailed information panel & footer links
    │       ├── GoalSlider.svelte # Interactive target calorie controller
    │       └── MacroBar.svelte # Reusable dynamic SVG/CSS nutrient indicator
    └── routes/            # File-system router layouts and screens
        ├── +layout.svelte # Main layout template injecting layout.css and Header
        ├── +layout.ts     # Prerendering & Static adapter configurations
        ├── layout.css     # OKLCH custom variables and tailwind v4 layer imports
        ├── +page.svelte   # Landing page with interactive, local demo sandbox
        ├── dashboard/     # Day-to-day macro tracking core screen
        ├── foods/         # Custom foods library catalog management
        │   ├── +page.svelte # Foods search & creation selector entry page
        │   ├── macros/    # Macronutrient manual input & AI estimator screen
        │   └── quantity/  # Serving size & custom food details wizard
        ├── log/           # Full food logging transaction screen
        ├── progress/      # Streak calculators, trend charts, and weight trackers
        ├── profile/       # Local database backups, daily targets, and API keys
        ├── cookies/       # Local cookie-free storage policies
        ├── privacy/       # Absolute offline client privacy statements
        └── terms/         # Terms of use (Free & local-only open-source license)
```

---

## 🛠️ Granular Technical Deep-Dives

### 1. IndexedDB Client-Side Database Manager (`src/lib/db.ts`)
The `IndexedDBManager` handles storage initialization, database migrations, and isolated asynchronous transactions. It defines three local object stores:
1. `foods`: Stores custom-created food objects.
2. `foodLogs`: Stores chronological records of consumed foods with exact timestamps.
3. `userStats`: Holds daily target metrics, current weights, and the optional Gemini API key under the `'current'` record key.

```typescript
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
    // Transactional queries (getAll, put, clear) are wrapped in modern JavaScript Promises.
}
```

### 2. Svelte 5 Reactive Store Pipeline (`src/lib/store.svelte.ts`)
The core `Store` class serves as the single source of truth for runtime data. By combining Svelte 5 `$state` fields with explicit persistence writes, memory and IndexedDB stay perfectly synchronized.

* **Reactivity Initialization**: The constructor runs only in the browser to load IndexedDB data asynchronously without blocking Server-Side Rendering (SSR).
* **Backup & Migration Engine**:
  * **CSV Reporting**: Automatically generates and downloads localized CSV sheets representing logged foods for the current calendar month.
  * **JSON Portability**: Serializes all IndexedDB stores into an portable, single-file backup JSON structure. Implements strict client-side verification routines during backup restoration to prevent corrupted schema states.

```typescript
class Store {
    foods = $state<Food[]>([]);
    foodLogs = $state<FoodLog[]>([]);
    userStats = $state<UserStats>({
        target_calories: 2000,
        target_proteins: 150,
        target_carbs: 200,
        target_fats: 65,
        target_fiber: 30,
        target_weight: 70,
        current_weight: 70,
        google_ai_studio_api_key: '',
    });

    constructor() {
        if (browser) {
            this.loadIndexedDB();
        }
    }
    
    save() {
        if (browser && dbManager) {
            dbManager.saveFoods(this.foods).catch(console.error);
            dbManager.saveFoodLogs(this.foodLogs).catch(console.error);
            dbManager.saveUserStats(this.userStats).catch(console.error);
        }
    }
    // Explicit mutators add/delete records and safely trigger synchronous persistence writes.
}
```

### 3. AI Macronutrient Predictor (`src/routes/foods/macros/+page.svelte`)
When creating a food draft, users can request an automatic estimate of macronutrients. This bypasses high-overhead local database scraping by using a zero-temperature, structured JSON prompt with Gemini:

```typescript
const prompt = `Estimate the macronutrients for the following food item. Respond with a JSON object exactly like this: {"calories": 100, "proteins": 10, "carbs": 20, "fats": 5, "fiber": 2}. Use numbers. Return ONLY valid JSON without Markdown blocks.
Food Name: ${foodDraft.name}
Quantity: ${foodDraft.quantity} ${foodDraft.units}
Special ingredients/notes: ${foodDraft.notes || 'None'}`;

const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
        }
    })
});
```

### 4. High-Performance Analytics Pipelines (`src/routes/progress/+page.svelte`)
Calzap features comprehensive local metric analysis computed reactively using Svelte 5's derived engine:
* **Grouping & Scaling**: Dynamically segments raw history arrays into daily calendar buckets depending on selected views (7, 14, or 30 days). Finds the maximum caloric value over the period in O(N) to compute standard chart scaling limits.
* **Logging Streak Heuristics**: Analyzes daily consumption histories chronologically. Computes active logging streaks with active check boundaries (ensuring streak continuity if today's entry is not yet completed but yesterday's was):

```typescript
const loggingStreak = $derived.by(() => {
    const logs = store.foodLogs;
    if (logs.length === 0) return 0;

    const loggedDates = new Set<string>();
    for (const log of logs) {
        const d = new Date(log.consumed_at);
        loggedDates.add(d.toDateString());
    }

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let checkDate = new Date(today);
    // Streak continuity check
    if (!loggedDates.has(today.toDateString())) {
        if (loggedDates.has(yesterday.toDateString())) {
            checkDate = yesterday;
        } else {
            return 0;
        }
    }

    while (true) {
        if (loggedDates.has(checkDate.toDateString())) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
});
```

---

## ⚡ Setup & Local Development

### Prerequisites
Calzap mandates **Node.js v20+** and uses **pnpm** as its fast, deterministic dependency package manager.

### Installation
Clone the repository and install the production/development dependencies:
```sh
# Clone repository
git clone https://github.com/sveltejs/cli.git calzap
cd calzap

# Install dependencies using pnpm
pnpm install
```

### Running Local Development Server
Boot up the high-speed Vite server with hot module reloading (HMR) enabled:
```sh
# Start development server and launch the browser automatically
pnpm dev --open
```

### Building & Prerendering Production Artifacts
Calzap compiles into an ultra-fast, completely prerendered static web app (`@sveltejs/adapter-static`). It executes static generation during compilation:
```sh
# Type-check TypeScript parameters and run Svelte-check
pnpm check

# Build production optimized bundle
pnpm build

# Preview compiled build locally
pnpm preview
```

The resulting optimized static build is exported directly to the `./build` folder. It can be immediately hosted on any edge server network (e.g., GitHub Pages, Vercel, Netlify, Cloudflare Pages) with absolute zero runtime server configuration. The live production instance is deployed at [calzap.ashwinig.com](https://calzap.ashwinig.com).

---

## 📄 License & Compliance

Calzap is open-source software, licensed under the **AGPL-3.0-or-later** license. 

It is provided "as is" without warranty. Because all core dietary calculations, history tracking, and database persistence run purely on the user's local hardware (with the optional AI estimation features queried directly from the browser to Google's AI Studio API via the user's own key), Calzap ensures complete user data ownership. No centralized application servers, tracking scripts, or third-party advertising cookie trackers are involved.
