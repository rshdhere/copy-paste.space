# copy-paste.space

Easily share text snippets and images between your phone, tablet, and computer instantly, without cables or complicated setup.

![Demo](assets/copy-paste.space-demo.gif)

## 📖 Introduction

**copy-paste.space** is a minimal web tool built with **TypeScript**, **Node.js**, and a lightweight frontend for instant **cross-device text sharing** — no sign-ups or logins required. Switch between devices or share notes quickly with a secure, rate-limited backend, deployed on **Railway** for privacy-focused use.

---

## ✨ Features
- 📱 **copy-paste.space support** – Works on mobile, tablet, and desktop
- ⚡ **Instant transfer** – Send and receive within seconds
- 🔒 **Secure** – End-to-end encryption for privacy
- 🌐 **No login required** – Just open the app and start sharing
- 🖼 **Image & text support** – Share notes, messages, or pictures effortlessly

---

## 📸 How It Works
- Visit https://copy-paste.space on both devices.
- Paste your text or upload an image.
- Instantly access the content from your other device.

---
## 🚀 Tech Stack

### 🎨 Frontend
- React with TypeScript
- react-router-dom 

### 🛠️ Backend
- Node.js
- TypeScript
- Express.js (assumed based on structure and middleware usage)
- dotenv for environment variable management

### ☁️ DevOps & Deployment
- Vercel (for frontend hosting and CI/CD)
- Railway (for backend infrastructure and environment management)
- Other Tools: dotenv, rate-limiting middleware, tsconfig, REST API

---

## 📦 Installation

To set up and run the project on your local machine:

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** or **yarn**
- **Git**
- **MongoDB** (for local development)

### 1️⃣ Fork and Clone

1. Fork the repository on GitHub

2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/copy-paste.space.git
   cd copy-paste.space
   ```
3. Add the original repository as upstream:
   ```bash
   git remote add upstream https://github.com/rshdhere/copy-paste.space.git
   ```
### 2️⃣ Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables in your `.env` file:
   ```
   PORT=8080
   MONGODB_URI=your_mongodb_connection_string
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The backend will be available at `http://localhost:8080`
### 3️⃣ Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`
### 4️⃣ Running Both Services

  You can run both services simultaneously by opening two terminal windows:

  **Terminal 1 (Backend):**
   ```bash
    cd backend
    npm run dev
   ```

  **Terminal 2 (Frontend):**
   ```bash
    cd frontend
    npm run dev
   ```
---

## Image Sharing Overview V1.5

![Demo](assets/copy-paste.space-V1.5.gif)

---

## 🤝Contributions
Contributors are welcome!

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
