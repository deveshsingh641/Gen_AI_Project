# Arena360 AI - FIFA World Cup 2026 Smart Stadium Platform ⚽🏟️

> **Transforming stadium operations and fan experience using real-time telemetry and Generative AI.**
> 
> Developed for the Gen AI Project Hackathon.

---

## 🌟 Introduction

Managing a FIFA World Cup stadium involves handling massive crowd flows, safety hazards, transport loads, and multilingual fan queries simultaneously. **Arena360 AI** is a dual-purpose control and engagement platform designed to solve these challenges.

The platform provides:
1. **Venue Command Center**: A premium desktop dashboard for stadium operators.
2. **Fan Companion App**: An interactive mobile application for attendees.

---

## 🚀 Key Features

### 1. 🖥️ Venue Command Center (Operator Console)
* **Real-time Telemetry Dashboard**: Live monitoring of overall occupancy, active safety incidents, congested gates, and queue throughput.
* **Dynamic Analytics Charts**: Interactive data visualizations (powered by Chart.js) tracking security gate queues and sector density.
* **GenAI Co-Pilot Incident Resolver**: Simulates a Generative AI chain-of-thought analysis for reported incidents (e.g., crowd bottlenecks, medical alerts). It automatically generates:
  * Reasoning steps
  * Immediate action plans
  * Dispatch instructions for nearby units
  * Context-aware localized public broadcast templates
* **Live Incident Feed**: Chronological log of stadium alerts with severity ratings (High, Medium, Low).

### 2. 📱 Fan Companion App (Mobile Suite)
* **GenAI Multilingual Concierge**: A simulated smart chatbot that automatically detects, translates, and responds in 5 languages:
  * English 🇬🇧
  * Spanish 🇪🇸
  * French 🇫🇷
  * Portuguese 🇵🇹
  * Arabic 🇸🇦
* **Stadium Radar**: Interactive guides for crowd bottlenecks at gates, food & concession wait times, and public transport capacity load.
* **Wayfinder Map**: Localized routing to help fans avoid long lines and easily locate nearest facilities.
* **Eco-Sustainability Guides**: Green stadium tips and real-time composting bin mapping.

---

## 🛠️ Technology Stack

* **Frontend**: HTML5, Vanilla JavaScript (ES6 Modules)
* **Styling**: Premium Vanilla CSS (Modern glassmorphic UI, responsive dashboard grid, glow effects, neon status animations, and mobile device frames)
* **Data Visualization**: Chart.js
* **AI Logic**: Custom simulated Generative AI reasoning chain and localization engine

---

## 📂 File Architecture

* 📄 [index.html](file:///c:/Users/user/OneDrive/Desktop/PromptWars/index.html) – Single-page responsive structure containing both the Operator Command Center and the Fan App views.
* 📄 [style.css](file:///c:/Users/user/OneDrive/Desktop/PromptWars/style.css) – Visual theme layout (dark mode, glassmorphic cards, animations, responsive layout).
* 📄 [app.js](file:///c:/Users/user/OneDrive/Desktop/PromptWars/app.js) – Core event controller, state synchronization, and DOM coordinator.
* 📄 [ai-engine.js](file:///c:/Users/user/OneDrive/Desktop/PromptWars/ai-engine.js) – Simulated GenAI agent logic, chain-of-thought blueprint generator, and multilingual translations.
* 📄 [mock-data.js](file:///c:/Users/user/OneDrive/Desktop/PromptWars/mock-data.js) – Live-updating simulator generating telemetry events (gate traffic, transit queue times, safety incidents).

---

## 💻 Setup & Run Instructions

Since this project is built entirely on native web standards (ES Modules), it requires a simple local web server to run correctly (to satisfy CORS browser policy on import statements).

### Option 1: Using Node.js (Recommended)
If you have Node installed, run this command in your project directory:
```bash
npx serve .
```
Then open the provided URL (e.g., `http://localhost:3000`) in your browser.

### Option 2: VS Code Live Server
1. Install the **Live Server** extension in VS Code.
2. Click **Go Live** at the bottom-right corner of the window.

### Option 3: Python Built-in Server
If you have Python installed, run:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your web browser.

---

## 🔮 Future Roadmap

* 🔗 **Live LLM Integration**: Connect the chatbot/incident helper to a live Gemini API endpoint for dynamic open-ended stadium support.
* 📍 **True Geolocational Routing**: Implement Mapbox or Leaflet.js with live BLE beacon telemetry for step-by-step navigation.
* 🔔 **Push Notifications**: Integrate service workers to alert fans of gate/transit delays directly on their lockscreens.
