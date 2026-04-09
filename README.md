# Next-Gen AI Companion Prototype 📱

An interactive AI companion engineered as a scalable React + Node.js web application, architected to serve as the blueprint for a Deep Native Android Application via tools like Capacitor.

## ✨ The Vision
Modern users are overwhelmed by notifications, sprawling calendar apps, and disjointed gaming portals. The goal of this companion is to merge **entertainment, productivity, and voice-first interaction** into a single personality-driven entity that lives on your dashboard.

## 🚀 Key Features Proof of Concept
Instead of writing thousands of lines of restrictive Native Java/Kotlin to hook into Android Accessibility Services immediately, this Prototype proves the core AI logic and Intent mapping flawlessly:
1. **Always-On Voice Engine:** Navigate the dashboard, add tasks, and ask for information strictly using integrated Web Speech APIs. The Backend mathematically determines your "Intent" (e.g. `read_calendar`, `navigate`).
2. **Notification Summarization Loop:** Using a live Notification Mock Generator, the AI reads arrays of "Screen Data", extracts actionable items (like forced Exams or Meetings), adds them to your Calendar natively, and speaks a Hinglish summary back to you.
3. **Interactive Hinglish Games:** Features custom-built **Snakes & Ladders** and **Tic Tac Toe**. Game states are sent to the AI to generate natively spoken, real-time Hinglish roasts about your gameplay.

## 🛠️ Tech Stack
* **Frontend:** React.js, Web Audio Synthesizers, Custom CSS Glassmorphism
* **Backend:** Node.js, Express, CORS
* **AI Engine:** OpenAI `gpt-4o-mini` (replacing older rate-limited schemas)

## 📦 Local Installation
You need two terminals to run the Client and the Server simultaneously.

### 1. Boot up the Server
```bash
cd server
npm install
node server.js
```
*The server will run on port 5000.*

### 2. Boot up the React Client
```bash
cd ai-companion
npm install
npm start
```
*The app will automatically open at http://localhost:3000.*
