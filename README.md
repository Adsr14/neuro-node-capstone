# 🌌 Nebula Workspace (Neuro-Node)

> An autonomous, biometrically-inspired AI dashboard with real-time 3D state reactions.

## 💡 Motivation
In the current era of "AI agentic" workflows, human-computer interaction often feels disconnected—the AI thinks in the terminal, and we work in the browser. **Nebula Workspace** aims to close that gap by providing a visual, biometrically-reactive interface that translates "hidden" AI state changes into intuitive, spatial, and auditory feedback.

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

## 📊 Understanding the Interface
* **Stress Strain Module:** Represents the AI's "cognitive load." As the stress coefficient rises above 0.7, the system triggers color-coded visual alerts and audio cues.
* **Buddy Unit:** Your 3D robotic companion; it reflects the real-time sync status between the agent's decision-making and your task queue.
* **Task Matrix:** An active, persistent list that dynamically syncs with the AI's prioritization logic.

## 🛠️ How to Run Locally

To experience the magic moment where the backend drives the 3D frontend, you will need to run both servers simultaneously.

### 1. Start the Data Bridge (Backend)
Open your first terminal and run the secure data pathway:
```bash
cd backend
python bridge.py
