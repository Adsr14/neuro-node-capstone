# 🌌 Nebula Workspace (Neuro-Node)

> An autonomous, biometrically-inspired AI dashboard with real-time 3D state reactions.
<img width="1912" height="850" alt="image" src="https://github.com/user-attachments/assets/554abe55-051e-47a8-975e-cc340499ab01" />

<img width="1852" height="816" alt="image" src="https://github.com/user-attachments/assets/b8bb5a2e-8f8a-4491-add3-5c7664fa9bdb" />

**(Note: Replace this line with an actual screenshot of your UI!)*

## 🚀 Overview
Nebula Workspace is a full-stack, local-first architecture designed to visualize AI logic in real-time. It bridges an autonomous Python AI agent with a high-performance React + Three.js graphical interface. When the AI agent processes data and shifts system states, the 3D UI autonomously reacts without requiring a page refresh.

## 🏗️ The Architecture (The "Triangle")
This project is built on three completely decoupled pillars:
1. **The Brain (`agents.py`):** An autonomous Python script that analyzes current tasks, calculates system stress, and rewrites the state.
2. **The Bridge (`bridge.py`):** A custom, robust HTTP local server that bypasses CORS restrictions to securely serve JSON data across environments.
3. **The Face (`App.tsx`):** A dynamic React frontend featuring Framer Motion glassmorphism and custom Three.js WebGL rendering.

## 💻 Tech Stack
* **Frontend:** React, TypeScript, Vite, Three.js (@react-three/fiber), TailwindCSS, Framer Motion
* **Backend:** Python 3, Custom HTTP Server (`http.server`)
* **Data Layer:** Local JSON state management 

## 🛠️ How to Run Locally

To experience the magic moment where the backend drives the 3D frontend, you will need to run both servers simultaneously.

### 1. Start the Data Bridge (Backend)
Open your first terminal and run the secure data pathway:
```bash
cd backend
python bridge.py
