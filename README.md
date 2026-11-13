# MissionCraft: From Blueprint to Orbit

**An educational space mission design game built for the NASA Space Apps Challenge 2026.**

🌐 **Live Website:** [https://space-mission-design-game.vercel.app](https://space-mission-design-game.vercel.app)

---

## Overview

**MissionCraft** is an interactive, browser-based educational game where players design, plan, and simulate scientific space missions.

As a mission engineer, players must:

- **Design** spacecraft by selecting and configuring different components.
- **Balance** engineering constraints such as mass, power, fuel, cost, and communications.
- **Plan** orbital trajectories to reach mission destinations.
- **Simulate** missions through different phases, from launch to science operations.
- **Respond** to dynamic events and engineering challenges.
- **Analyze** mission results and improve future attempts.

### Mission Types

| Mission | Destination | Difficulty | Budget |
|---|---|---|---|
| 🌍 EarthWatch-1 | Low Earth Orbit (500 km) | Beginner | $120M |
| 🌕 LunaMapper | Lunar Orbit (100 km) | Intermediate | $350M |
| 🌗 Artemis Scout | Lunar South Pole Surface | Advanced | $600M |
| 🔴 MarsSpy | Mars Orbit (300 km) | Expert | $900M |

---

## Features

- Interactive spacecraft design and component selection.
- Engineering calculations involving mass, power, fuel, and cost.
- Mission planning and orbital trajectory selection.
- Space mission simulation with different mission phases.
- Dynamic mission events and engineering challenges.
- Mission scoring and performance analysis.
- 3D spacecraft and space visualization.
- Educational content about spacecraft engineering and space exploration.

---

## Prerequisites

Before running the project locally, make sure you have:

- **Node.js** v18 or later ([Download Node.js](https://nodejs.org))
- **npm** v9 or later (included with Node.js)
- A modern web browser such as Chrome, Firefox, Edge, or Safari.
- A GPU-capable graphics card for smoother 3D visualization.

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/diya-shaikha/space-mission-design-game.git
```

### 2. Navigate to the Project Folder

```bash
cd space-mission-design-game
```

### 3. Install Dependencies

```bash
npm install
```

---

## Running the Game

Start the development server:

```bash
npm run dev
```

Open the following address in your browser:

```text
http://localhost:5173
```

---

## Building for Production

To create a production build, run:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

The production-ready files are generated in the `dist/` directory.

---

## Project Structure

```text
space-mission-design-game/
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   ├── data/
│   ├── engine/
│   ├── store/
│   ├── screens/
│   └── components/
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

## Engineering Model

MissionCraft introduces simplified spacecraft engineering calculations to help players understand the challenges involved in planning space missions.

### 1. Delta-V: Tsiolkovsky Rocket Equation

The rocket equation is used to calculate the change in velocity a spacecraft can achieve using its propulsion system.

$$
\Delta V = I_{sp} \times g_0 \times \ln\left(\frac{m_0}{m_f}\right)
$$

Where:

- \(I_{sp}\) = Specific impulse (seconds)
- \(g_0\) = Standard gravitational acceleration (9.80665 m/s²)
- \(m_0\) = Initial mass of the spacecraft
- \(m_f\) = Final mass after propellant consumption

### 2. Solar Power Model

Solar panel output decreases as the distance from the Sun increases.

$$
P_{actual} = P_{1AU} \times \left(\frac{1\text{ AU}}{d}\right)^2
$$

Where:

- \(P_{actual}\) = Available solar power at the spacecraft's location
- \(P_{1AU}\) = Solar power at 1 astronomical unit
- \(d\) = Distance from the Sun in astronomical units

Mars, at approximately 1.52 AU, receives around 43% of Earth's solar energy per unit area.

### Engineering Constraints

The game considers several engineering factors:

- Payload mass versus launch vehicle capacity.
- Power generation versus power consumption.
- Available delta-V versus mission requirements.
- Total spacecraft cost versus mission budget.
- Spacecraft component compatibility.
- Mission-specific scientific instrument requirements.

---

## Gameplay Guide

### Step 1: Select a Mission

Choose a mission based on its destination, difficulty, and budget. Beginners can start with **EarthWatch-1**.

### Step 2: Design Your Spacecraft

Select and configure spacecraft components, including:

1. Launch Vehicle
2. Spacecraft Bus
3. Propulsion System
4. Power System
5. Scientific Instruments
6. Communication System
7. Thermal Control System
8. Attitude Control System

Monitor the engineering statistics and resolve design errors before proceeding.

### Step 3: Plan Your Mission

Review the mission trajectory and engineering checklist before launching.

### Step 4: Simulate the Mission

Follow the spacecraft through different mission phases and respond to dynamic events and challenges.

### Step 5: Review Mission Results

Analyze your mission performance, including:

- Mission objectives completed or failed.
- Overall score and performance breakdown.
- Engineering efficiency.
- Recommendations for improvement.

---

## Educational Content

MissionCraft helps players explore important concepts in space science and engineering:

- **Orbital Mechanics:** Understanding orbital trajectories and delta-V requirements.
- **Rocket Propulsion:** Learning about the rocket equation, specific impulse, and fuel consumption.
- **Spacecraft Power Systems:** Exploring solar panels, batteries, and radioisotope thermoelectric generators (RTGs).
- **Space Communications:** Understanding communication systems and deep-space data transmission.
- **Mission Design:** Balancing scientific objectives, cost, mass, power, and engineering risks.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| React 18 | User interface development |
| TypeScript 5.6 | Type-safe development |
| Three.js r170 | 3D graphics and rendering |
| React Three Fiber | React integration with Three.js |
| @react-three/drei | 3D helpers and controls |
| Zustand 5 | State management |
| Vite 6 | Development server and build tooling |
| Tailwind CSS 3 | Styling and responsive design |
| Lucide React | Icons |

---

## Data and Attribution

- **Spacecraft component data:** Informed by publicly available technical information from space agencies and industry sources.
- **Mission concepts:** Inspired by real-world space missions, including Landsat 9, Lunar Reconnaissance Orbiter (LRO), Chandrayaan-3, Mars Reconnaissance Orbiter (MRO), and Mars Express.
- **Orbital calculations:** Based on simplified educational models of orbital mechanics.
- **Delta-V values:** Approximate values intended for educational illustration.

**Disclaimer:** MissionCraft is an independent educational project. It is not affiliated with, sponsored by, or endorsed by NASA.

---

## Project Development

MissionCraft was developed as an educational space mission design game for the **NASA Space Apps Challenge 2026**.

The project uses a modular structure to organize its main functionality:

- Mission data and spacecraft components are organized in the `src/data/` directory.
- Engineering calculations are organized in the `src/engine/` directory.
- Game state is managed in the `src/store/` directory.
- Game screens and interface components are organized in the `src/screens/` and `src/components/` directories.

---

**Explore space. Design missions. Think like a space engineer.** 🚀
