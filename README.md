# YouTube Balanced Guard

> **Keep 100% native YouTube UI — eliminate fast-dopamine kids slop, Shorts, brainrot, and algorithmic rabbit holes.**

**YouTube Balanced Guard** is a lightweight, privacy-first Tampermonkey / Violentmonkey userscript that turns real `youtube.com` into a calm, balanced-paced viewing experience for kids and younger siblings — **without switching to third-party apps** and **without showing obvious "Blocked!" overlays**.

By default, every new YouTube tab opens in **`STRICT` Mode** (45 curated, balanced-paced official cartoon channels only) and automatically fills the starting Home / Explore page and Watch-page suggestions with **3–4 randomly picked full-length videos from each approved channel** using YouTube's own built-in RSS feeds — while you can switch any single tab into **`SMART` Mode** in one keypress (`Ctrl + Numpad 9`) for your own normal browsing.

---

## Why This Exists

- **Third-party clients (FreeTube / YouTube Kids) feel different:** Kids quickly notice a different interface and want "real YouTube."
- **Keyword blacklists alone always leak:** Content farms evade word filters using foreign clones (Indonesian, Arabic, Japanese, Hindi, Bangla, Kannada, Russian, Spanish), emoji-only titles (`🚜🔴🟢🔵🚒`), Unicode bold bypass fonts (`𝐓𝐑𝐔𝐂𝐊`), and bland titles (`"Episode 4"`).
- **Hiding slop leaves YouTube blank:** Even when an adblocker hides 18 out of 20 bad cards, you are left staring at an empty Home grid or a sparse sidebar.

**YouTube Balanced Guard solves all three** directly inside native `youtube.com`:
1. Verifies channels by **immutable `UC...` Channel ID**, canonical **`/@handle`**, and dedicated **channel-slot display name** (knockoffs stuffing `"Bluey - Official Channel"` into a video title cannot spoof it).
2. Fetches fresh, non-Short videos directly from YouTube's own `/feeds/videos.xml` feeds (with automatic `/videos` fallback for Short-heavy channels), caches them locally for **6 hours**, and saturates Home / Explore and Watch suggestions using **native YouTube Dark/Light CSS theme variables** — zero external servers, zero API keys, zero tracking.
3. Closes player loopholes automatically: removes **Shorts** (shelves, sidebar tabs, and direct `/shorts/...` URLs), **End-Screen video walls**, **creator end-cards**, **pause overlays**, **Playables**, and forces **Autoplay OFF**.

---

## Modes at a Glance

| Feature | `STRICT` Mode *(Default — Kid / Brother Mode)* | `SMART` Mode *(Shared Account / Session Override)* |
| :--- | :--- | :--- |
| **Home / Explore (`/`, `/feed/explore`)** | Hides raw algorithmic feed & slop topic chips; fills Home with **3–4 random full-length videos per approved channel** (`60` cards immediately + seamless infinite scroll across ~150 shuffled videos). | Keeps your normal adult videos (tech, gaming, news, music) untouched; hides `<= 90s` clips and multi-language kids/slop farms while exempting all 45 approved channels. |
| **Watch-Page Suggestions** | **Strictly approved channels only**, automatically topped up with **22 shuffled videos** across ~20 approved channels (adapts to both 1-column right sidebar and 2-column narrow grid). | Normal on adult videos; **automatically locks & saturates** to your 45 approved channels whenever playing any approved cartoon *or* any *"Made for Kids"* video. |
| **Direct Video / Channel Links** | Silently redirects away from any unapproved `/watch?v=...`, `/@handle`, or `/channel/UC...` page (no scary warning banner). | Allowed freely. |
| **Search Results (`/results`)** | Shows **only** full-length videos (`> 90s`) from approved channels. | Filters out slop/kids-farm results & `<= 90s` clips; normal searches work. |

---

## Installation

### Prerequisites
Install a userscript manager in your browser:
- **Firefox:** [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) or [Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)
- **Chrome / Brave / Edge:** [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) *(enable Developer Mode in `chrome://extensions` if prompted by Manifest V3)*

### Option A — 1-Click Install (Recommended)
1. Click the raw userscript link: **[Install `youtube-balanced-guard.user.js`](https://raw.githubusercontent.com/ArDRaFi/youtube-balanced-guard/main/youtube-balanced-guard.user.js)**
2. Tampermonkey will open an installation tab → click **Install**.
3. Open or hard-refresh [youtube.com](https://www.youtube.com) (`Ctrl + Shift + R`).
4. On first load, if Tampermonkey shows a one-time `@connect www.youtube.com` permission prompt (used to fetch your 45 channels' official YouTube RSS feeds), click **Always allow domain**.
5. Wait ~2 seconds for the initial 45-channel video pool (~490 videos) to populate and cache locally. Every reload after that renders instantly (`0 ms`).

### Option B — Manual Copy-Paste Install
1. Open [`youtube-balanced-guard.user.js`](./youtube-balanced-guard.user.js) and copy the entire file.
2. Click the **Tampermonkey** toolbar icon → **Create a new script...**
3. Select all (`Ctrl + A`), paste the code, change `GUARD_PIN = '1234'` near the top to your own PIN, and save (`Ctrl + S`).
4. Hard-refresh YouTube (`Ctrl + Shift + R`).

### Optional Companion: uBlock Origin Filter
If you only want pure CSS/procedural filtering without Tampermonkey (or want an extra adblock-level layer), a standalone uBlock Origin filter list is also included in [`ublock-companion-filter.txt`](./ublock-companion-filter.txt).
*(Note: When running the Tampermonkey userscript, you do **not** need the companion uBlock filter — keep uBlock Origin purely for ad-blocking so both don't scan YouTube's DOM twice.)*

---

## Keyboard Shortcuts & Controls

The script renders **zero visible buttons or banners** on YouTube. All controls are hidden behind keyboard shortcuts and the Tampermonkey extension menu:

| Shortcut / Menu | Scope | Action |
| :--- | :--- | :--- |
| **`Ctrl + Numpad 9`** | Current tab only (`sessionStorage`) | Toggles **this tab** into **`SMART` Mode** (press again to return to **`STRICT`**). Closing the tab or opening a new YouTube tab automatically resets to **`STRICT` Mode**. |
| **`Ctrl + Alt + Numpad 9`** | Current tab only (`sessionStorage`) | Conflict-free backup for `Ctrl + Numpad 9` (useful on Firefox when multiple tabs are open and Firefox intercepts bare `Ctrl + 9` to jump to the last tab). |
| **`Ctrl + Alt + Shift + G`** | Global *(PIN protected)* | Opens the hidden settings prompt:<br>• `1` — Set persistent mode to **`SMART`**<br>• `2` — Set persistent mode to **`STRICT`** *(default)*<br>• `3` — Toggle **Home → `/feed/subscriptions`** redirect<br>• `4` — **`OFF`** (temporarily disable guard)<br>• `5` — Force-refresh the 45-channel video pool immediately |
| **Tampermonkey Icon → Menu** | Both | Direct menu entries for **Balanced Guard Settings (PIN)** and **Toggle Session Smart Mode (Ctrl+Num9)**. |

> **Default PIN:** `1234` — edit `const GUARD_PIN = '1234';` at the top of `youtube-balanced-guard.user.js` after installing.

---

## Curated 45 Balanced-Paced Channels Included

All 45 channels are verified official channels chosen for calm pacing, visual craft, and low-stimulation storytelling:

| Category | Channels |
| :--- | :--- |
| **Gentle Storybook & Nature** | Bluey - Official Channel, Puffin Rock, Tumble Leaf, Little Bear, Max & Ruby, Oswald The Octopus, Sarah and Duck, Curious George, Paddington Bear, Kipper, Franklin and Friends, Charlie and Lola, Moomin Official, Molang, Hey Duggee, Ben and Holly's Little Kingdom, Peppa Pig's Big Adventures, Octonauts |
| **Stop-Motion, Claymation & Quiet Visual Comedy** | Shaun the Sheep, Wallace & Gromit, Morph, Pingu, Pat a Mat, Minuscule, Simon's Cat, Classic Mr Bean, Mr Bean, Official Pink Panther, Masha and The Bear, Oddbods & ARPO The Robot |
| **Bangla & Educational Classics** | Duronto TV, Sisimpur, Omar & Hana, Kids Land, Sesame Street, PBS KIDS, Treehouse Direct |
| **Classic Cartoons & Animation** | Thomas & Friends, SpongeBob SquarePants Official, The Fairly OddParents, WB Kids, Warner Bros. Classics, Popeye And Friends Official, Woody Woodpecker, MAGNETFILM |

---

## Customization

Open the script in **Tampermonkey Dashboard** to customize any setting at the top of the file:

```js
const GUARD_PIN = '1234';            // Change to your private PIN
const DEFAULT_MODE = 'strict';       // 'strict' | 'smart' | 'off'
const MAX_SHORT_SECONDS = 90;        // Hide clips <= 90 seconds (1:30)
const HOME_MIN_PER_CHANNEL = 3;      // Min random videos picked per channel on Home
const HOME_MAX_PER_CHANNEL = 4;      // Max random videos picked per channel on Home
const POOL_CACHE_TTL_MS = 6 * 3600 * 1000; // Refresh channel RSS feeds every 6h
```

### Adding or Removing Channels
Find the `APPROVED_CHANNELS` array in `youtube-balanced-guard.user.js` and add or delete entries:

```js
{
  id: 'UCVzLLZkDuFGAE2BGdBuBNBg',    // Channel's immutable UC... ID
  handle: '@blueyofficialchannel',   // Lowercase @handle
  name: 'Bluey - Official Channel',  // Exact YouTube display name
  color: '#4ea8de'                   // Avatar circle color on Home cards
}
```

After editing `APPROVED_CHANNELS`, press **`Ctrl + Alt + Shift + G`** → enter your PIN → press **`5`** to immediately refresh the cached video pool.

*(Tip: To find any channel's `UC...` ID, open the channel page → click **more** in the description → **Share channel → Copy channel ID**.)*

---

## How It Works Under the Hood (Privacy & Security)

- **100% Local & Zero Telemetry:** No external APIs, proxies, or analytics. The script only talks to `https://www.youtube.com/feeds/videos.xml` (and `/@handle/videos` fallback for Short-heavy channels).
- **YouTube TrustedHTML CSP-Safe:** Uses a pure-JS Atom XML parser (`parseAtomEntries`) and `document.createElement` DOM builders — zero `DOMParser.parseFromString` and zero `innerHTML`, so it runs cleanly under YouTube's strict `require-trusted-types-for 'script'` CSP on both Firefox and Chromium.
- **SPA-Safe:** Listens to YouTube's native `yt-navigate-finish`, `yt-page-data-updated`, `popstate`, and `resize` events with async mutex locking and debounced `MutationObserver`.

---

## Troubleshooting

- **Home page only shows a few videos on first install:**
  Make sure you clicked **Always allow domain** on Tampermonkey's `@connect www.youtube.com` prompt, then press `Ctrl + Alt + Shift + G` → PIN → **`5`** to force-refresh the pool.
- **`Ctrl + Numpad 9` switched tabs instead of toggling Smart Mode (Firefox):**
  When multiple tabs are open, Firefox maps `Ctrl + 9` to "jump to last tab." Use **`Ctrl + Alt + Numpad 9`** instead (or click **Tampermonkey icon → Toggle Session Smart Mode**).
- **Want zero algorithm poisoning on a shared computer?**
  Create a free separate YouTube Brand Channel at [youtube.com/channel_switcher](https://www.youtube.com/channel_switcher) → *Create a channel*, subscribe only to your favorite balanced channels, and leave YouTube Balanced Guard in `STRICT` mode.

---

## License

[MIT](./LICENSE)
