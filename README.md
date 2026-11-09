# Al-Bayan: AI-Powered Quran & Tafseer Ecosystem

<div align="center">
  <p><strong>Advanced Islamic & EdTech Quran Application</strong></p>
  <p>Verse-by-verse multi-Qari sequential dual-track audio, Urdu / Sindhi / English translations, Tajweed coloring, AI Tafseer assistant, smart semantic voice search, and offline reading.</p>
</div>

---

## 🚀 How to Run the App

### Option 1: Double-Click App Launcher (Easiest)
Simply double-click **`Launch-Al-Bayan.bat`** in this folder.
- Automatically compiles production assets if needed.
- Starts the Al-Bayan server on an open port.
- Opens the app in a **native standalone desktop window** (via Edge/Chrome App Mode) without address bars or tabs!

### Option 2: Run via Terminal
```bash
# 1. Compile production assets
npm run build

# 2. Launch desktop app mode
npm run app
```

### Option 3: Development Mode
```bash
npm run dev
```

---

## 🛠 Available Scripts

| Command | Description |
|---|---|
| `npm run app` | Builds (if needed), starts production server, and launches standalone app window |
| `npm run build` | Compiles the Vite React application into optimized static assets in `dist/` |
| `npm run start` | Starts the production server hosting `dist/` |
| `npm run dev` | Starts the local Vite development server with hot-module reloading |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run clean` | Cross-platform cleanup of build outputs (`dist/`) |
| `npm run android:open` | Opens the native Android project in Android Studio |
| `npm run android:sync` | Syncs the latest web assets to the Android project |
| `npm run apk:build` | Runs the automated Android APK builder script |

---

## 📱 Generating the Android APK

The native Android project is 100% generated in the [`android/`](android/) directory.

### Method 1: 1-Click via Android Studio (Recommended)
1. Run `npm run android:open` (or open Android Studio and choose the `android` folder).
2. Click **Build** ➔ **Build Bundle(s) / APK(s)** ➔ **Build APK(s)**.
3. Android Studio will notify you with a link to your ready-to-install `app-debug.apk`.

### Method 2: GitHub Actions Automated Build
A workflow is configured in [`.github/workflows/build-apk.yml`](.github/workflows/build-apk.yml). Push the repo to GitHub to have the APK compiled automatically in GitHub Actions and available for download under the **Actions** tab.

### Method 3: Command Line (Gradle)
Once Java 17+ and the Android SDK are set up:
```bash
cd android
./gradlew.bat assembleDebug
```
The compiled APK will be created at `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🔑 AI Features & Environment Setup

Copy or edit [.env](.env):
```env
# Optional: Paste your Gemini API key for real-time generative scholarship
GEMINI_API_KEY=your_key_here

# Port (defaults to 3000, automatically increments if 3000 is occupied)
PORT=3000
```
> **Note:** If no `GEMINI_API_KEY` is provided, Al-Bayan automatically operates in **local offline mode**, providing full Quran reading, translations, audio recitation, curated classical tafseer reflections, and instant thematic semantic search!
