# 🎬 WaveMirror v1.0.0 Release Notes

> **Version**: `v1.0.0`  
> **Release Date**: August 1, 2026  
> **Platforms**: Web Application & Native Android App (`.apk`)  
> **API Engine**: TMDB API (`fea469f5e20796590292a227a92a2fef`)

---

## 🚀 Key Features & Improvements

### 🎥 1. Authentic TMDB API & Multi-Server Player Engine
* **Live Catalog & Predictive Search**: Live fetching for Trending Movies (`/trending/movie/week`), Trending TV Series (`/trending/tv/week`), Genre Filtering (`/discover/movie`), and Real-Time Search (`/search/multi`).
* **IMDb External ID Resolution**: Automatic lookup via `/movie/${id}/external_ids` to fetch IMDb IDs (e.g. `tt15239678`) for maximum stream compatibility.
* **4-Server Fallback Switcher**: Instant switching between 4 embed providers:
  - **Server 1**: `vidsrc.pm`
  - **Server 2**: `vidsrc.xyz`
  - **Server 3**: `vidsrc.to`
  - **Server 4**: `autoembed.to`
* **TV Series Season & Episode Controls**: Interactive Season and Episode dropdown selectors for multi-season TV shows.

---

### 🛡️ 2. In-App Built-In Ad & Popup Shield
* **Popup Intercepting**: Global `window.open` interceptor blocks external script popups silently and displays a `"🛡️ Ad Popup Intercepted"` notification.
* **Focus Guard**: Automatic window focus guard prevents popunder tabs from stealing browser focus.
* **1-Click Clean Player Bar**: Added **"⚡ Clear Ad Overlay / Refresh Stream"** button above the player modal to clear internal video ad overlays instantly without losing playback position.

---

### 🎨 3. Cyber Neon Crimson & Electric Violet UI Redesign
* **Curated Color Tokens**: Deep Obsidian background (`#060813`), Cyber Neon Crimson (`#ff2a5f`), Ultra Violet Glow (`#7000ff`), and Sunburst Gold (`#ffb703`).
* **Glassmorphism Components**: Glass backdrop blurs, glowing card borders, smooth hover transforms, and responsive Top 10 ranked rail.
* **Branding Integration**: Custom WaveMirror logo asset (`9dff5f12-e1c4-4575-81f4-5184844ca983.png`) integrated into the navbar, footer, splash screen, and Android app icons.
* **Instagram Profile Modal**: In-app profile modal highlighting creator handle `@_beat_labs`.

---

### 📱 4. Native Android App (`app/` Subfolder)
* **Hardware Accelerated WebView**: Native Android app configured to load `https://wavemirror.vercel.app/` with DOM storage, database caching, and hardware acceleration enabled.
* **Fullscreen 4K Player**: Custom `WebChromeClient.onShowCustomView()` implementation for immersive full-screen video streaming.
* **Hardware Back Button**: `OnBackPressedDispatcher` navigates WebView history smoothly before exiting.
* **Signed Release Build Configuration**: `signingConfig signingConfigs.debug` enabled in `app/app/build.gradle` so the compiled APK installs on all Android devices (Android 10 through 15) without `"Package appears to be invalid"` errors.

---

### ⚙️ 5. GitHub Actions CI/CD Pipeline
* **Automated APK Builder**: [.github/workflows/build.yml](file:///d:/WEBSITES/wavemirror%20rede/.github/workflows/build.yml) workflow configured with JDK 17, `gradle/actions/setup-gradle@v3`, and Gradle 8.10.
* **Universal Release APK**: Generates `WaveMirror-Signed.apk` automatically on push or manual trigger.

---

## 🛠️ Tech Stack & Dependencies
* **Frontend**: HTML5, Vanilla JavaScript (ES6+), Vanilla CSS3 Design System.
* **Fonts**: Google Fonts (`Outfit` & `Plus Jakarta Sans`).
* **API**: The Movie Database (TMDB) API (`https://api.themoviedb.org/3`).
* **Android**: Java, Android SDK 34, AndroidX AppCompat, Material Design Components, SwipeRefreshLayout, Gradle 8.10, AGP 8.5.2.
