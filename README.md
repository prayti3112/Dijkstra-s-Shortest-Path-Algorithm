# 🌐 Dijkstra's Shortest Path Algorithm // 3D Interactive Visualizer

A highly interactive, fully 3D, and animated web application visualizing **Dijkstra's Single-Source Shortest Path (SSSP)** algorithm with real-time reactive weight adjustment. Built with **React 19**, **Three.js (React Three Fiber & Drei)**, **Framer Motion**, and **Tailwind CSS v4**.

![Dijkstra 3D Visualizer Banner](https://img.shields.io/badge/WebGL-Three.js-blue?style=for-the-badge&logo=three.js)
![React 19](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)
![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

---

## 🌟 Key Highlights

- **🌌 3D Space & Cyber-Glassmorphism**: Complete 3D coordinate space with volumetric node spheres (`MeshStandardMaterial`), rotating holographic wireframe toruses, orbiting satellite photons, and volumetric cylindrical link tubes.
- **⚡ Real-Time Reactive Re-routing**: Slide any link's weight/cost slider in real-time. Dijkstra's algorithm recalculates instantaneously, seamlessly shifting the active shortest path with animated photon streams!
- **📊 Floating Predecessor Table HUD**: Glassmorphic overlay displaying the dynamic routing table, current tentative/final distance ($d(v)$), predecessor ($\pi(v)$), state chips, and total path cost with Framer Motion stagger animations.
- **🎛️ Dynamic 3D Node & Edge Management**: Add, remove, and rename routers. Adjust Euclidean coordinates $(X, Y, Z)$ using real-time sliders to watch 3D nodes reposition dynamically.
- **🎥 3D Camera Controls**: Damped `OrbitControls` (Rotate, Pan, Zoom) with one-click view presets (**Cinematic**, **Isometric**, **Top-Down 2D**, **Front Elevation**) and an **Auto-Orbit** mode.
- **🕹️ Dual Calculation Modes**:
  1. *Real-Time Reactive Mode*: Instant recalculation upon topological or metric mutation.
  2. *Step-by-Step Simulation Mode*: Play, pause, scrub, and step through each priority queue extraction and edge relaxation with live algorithmic explanations.
- **🔊 Web Audio API Synthesizer**: Procedural sci-fi chimes, blips, and mechanical clicks on path transitions and slider adjustments (with zero external audio assets).

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** (or yarn / pnpm)

### Setup & Run
```bash
# 1. Clone the repository
git clone https://github.com/prayti3112/Dijkstra-s-Shortest-Path-Algorithm.git

# 2. Navigate to the project directory
cd Dijkstra-s-Shortest-Path-Algorithm

# 3. Install dependencies
npm install

# 4. Start the local development server
npm run dev
```

Open your browser and navigate to **`http://localhost:5173/`**.

---

## 📐 Network Engineering & Theoretical Foundation

In link-state routing protocols such as **Open Shortest Path First (OSPF)** and **IS-IS**, routers maintain a synchronized **Link-State Database (LSDB)** and independently compute the shortest path tree to all network destinations using Dijkstra's algorithm.

### Algorithmic Relaxation Condition
For an undirected weighted graph $G = (V, E)$, Dijkstra's algorithm maintains a distance array $d[v]$ and predecessor mapping $\pi[v]$. For each edge $(u, v)$ with weight $w(u, v)$:

$$\text{Relax}(u, v): \quad \mathbf{if} \; d[v] > d[u] + w(u, v) \implies d[v] \leftarrow d[u] + w(u, v), \quad \pi[v] \leftarrow u$$

Whenever link weights fluctuate (simulating network congestion or bandwidth degradation), the application demonstrates real-time SPF tree invalidation and instantaneous path reconfiguration.

---

## 🎨 Color Coding Telemetry

| Element | Color Palette | Description |
| :--- | :--- | :--- |
| **Source Router** | Emerald Beacon (`#10b981`) | Packet origination point ($d[s] = 0$) |
| **Target Router** | Gold Beacon (`#f59e0b`) | Destination egress node |
| **Optimal Path** | Neon Crimson / Gold (`#ff0055`) | Active shortest path with moving photon flow |
| **Normal Links** | Neon Cyan (`#00f0ff` / `#0284c7`) | Standard interconnected graph edges |
| **Settled Nodes** | Electric Violet (`#8b5cf6`) | Explored vertices added to shortest path tree |

---

## 📂 Project Structure

```
├── src/
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── EdgeLine.tsx        # Volumetric 3D tube with photon flow animation
│   │   │   ├── Graph3D.tsx         # Assembles 3D nodes & links
│   │   │   ├── NodeSphere.tsx      # Glowing 3D sphere with holographic rings & HTML badge
│   │   │   ├── ParticleField.tsx   # Ambient starfield & cyber floor grid
│   │   │   └── Scene.tsx           # Three.js Canvas, lighting, & OrbitControls
│   │   └── ui/
│   │       ├── AlgorithmControls.tsx # Mode switcher & Step-by-Step simulator
│   │       ├── CameraHUD.tsx         # Camera angle presets & auto-orbit toggle
│   │       ├── EdgeManagerPanel.tsx  # Dynamic weight sliders & connection tool
│   │       ├── Header.tsx            # HUD header, metrics, presets, & guide
│   │       ├── NodeManagerPanel.tsx  # 3D spatial coordinate sliders & node CRUD
│   │       └── PredecessorHUD.tsx    # Animated predecessor table & total cost
│   ├── constants/
│   │   └── presets.ts              # Pre-configured 3D network topologies
│   ├── types/
│   │   └── graph.ts                # TypeScript interfaces for nodes, edges, & SPF steps
│   ├── utils/
│   │   ├── dijkstra.ts             # Dijkstra SSSP implementation with step tracing
│   │   └── sound.ts                # Web Audio API sound synthesizer
│   ├── App.tsx                     # Main visualizer state manager
│   ├── index.css                   # Tailwind CSS v4 & glassmorphism styling
│   └── main.tsx                    # React entry point
├── TECHNICAL_REPORT.md             # In-depth academic & technical documentation
├── package.json
└── vite.config.ts
```

---

## 📄 Academic Documentation

An in-depth university technical document is included in [`TECHNICAL_REPORT.md`](./TECHNICAL_REPORT.md), covering:
- Mathematical Link-State routing formulations
- 3D WebGL render pipeline & shader kinematics
- Empirical weight perturbation experiments
- A complete **4-Router University Examination Numerical Problem** with step-by-step relaxation tables.

---

## 📜 License

This project is licensed under the **MIT License**.
