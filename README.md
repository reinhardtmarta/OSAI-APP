<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# OSAI - Active & Secure AI Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x+-purple?logo=vite)](https://vitejs.dev/)
[![Gemini API](https://img.shields.io/badge/Powered%20by-Gemini%20API-4285F4?logo=google)](https://ai.google.dev/)

**OSAI** is an **always-active, highly secure** AI assistant designed to help you with daily tasks — fast, smart, and privacy-first.

It stays responsive, understands context, and delivers helpful answers while **never** running code autonomously, accessing sensitive data without explicit permission, or storing conversations externally.

### ✨ Key Features

- Clean, modern, responsive interface (works great on desktop & mobile)
- Powered by **Google Gemini API** (latest models)
- Conversation history saved locally (browser localStorage)
- Automatic dark mode support
- Real-time streaming responses (typewriter effect)
- **Security-first design**: API key stays in your browser only, no server-side storage, no auto-actions

### 🚀 Live Demo

https://reinhardtmarta.github.io/OSAI-APP/  
*(or run it locally — see instructions below)*

### 📸 Screenshots

Here are some clean, modern icon ideas for OSAI (circle "O" with intelligent/secure elements inside — perfect for app icon, favicon or README):

Here are minimalist futuristic options with digital eye / neural vibes in blue neon:<grok:render card_id="96cec1" card_type="image_card" type="render_searched_image">
<argument name="image_id">6</argument>
<argument name="size">"LARGE"</argument>
</grok:render><grok:render card_id="394d46" card_type="image_card" type="render_searched_image">
<argument name="image_id">7</argument>
<argument name="size">"LARGE"</argument>
</grok:render>

And strong geometric shield / protection focused designs in dark mode blue-purple:<grok:render card_id="0d4210" card_type="image_card" type="render_searched_image">
<argument name="image_id">1</argument>
<argument name="size">"LARGE"</argument>
</grok:render><grok:render card_id="98ace2" card_type="image_card" type="render_searched_image">
<argument name="image_id">5</argument>
<argument name="size">"LARGE"</argument>
</grok:render>

### 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **AI Backend**: Google Gemini API
- **State**: React Context + localStorage
- **Deployment**: GitHub Pages / Vercel / Netlify

### 🔧 Local Development

1. Clone the repository
```bash
git clone https://github.com/reinhardtmarta/OSAI-APP.git
cd OSAI-APP
```

2. Install dependencies
```bash
npm install
# or yarn install / pnpm install
```

3. Create `.env.local` in the root and add your Gemini API key:
```
VITE_GEMINI_API_KEY=your-api-key-here
```

> Get a free key at: https://aistudio.google.com/app/apikey  
> (generous free tier for personal use)

4. Start the development server
```bash
npm run dev
# or yarn dev / pnpm dev
```

5. Open http://localhost:5173 in your browser

### 📦 Build for Production

```bash
npm run build
```
The `dist/` folder is ready for deployment (GitHub Pages, Vercel, etc.).

### 📱 Turn into a Native Mobile App (APK + iOS)

This is a web app, but you can easily convert it to native Android/iOS using **Capacitor**:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init
npx cap add android
npm run build
npx cap copy
npx cap open android   # opens Android Studio → build APK
```

(iOS requires a Mac + Xcode)

### 🛡️ Security & Privacy

- Your Gemini API key **never** leaves your device/browser
- No conversations are sent to or stored on any external server
- The assistant **never** executes code, opens links, or performs actions automatically
- 100% client-side operation

### 📄 License

MIT License — see the [LICENSE](LICENSE) file for details.

### ❤️ Contributions

Feel free to open issues, suggest features, or submit pull requests!

Built with 🤖 + 🔒 by [@reinhardtmarta](https://github.com/reinhardtmarta)

```

Feel free to tweak it (add real screenshots, change tone, etc.). Let me know if you want a shorter version or more sections! 😊
# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1OYovX--m97V_jTbxLJeCmwP2WGWrCHC0

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
