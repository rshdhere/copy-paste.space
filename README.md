# copy-paste.space

### Seamlessly share text across devices through a clean, browser-based clipboard.

---

## Introduction

**copy-paste.space** is a minimalistic web tool built with **TypeScript**, **Node.js**, and a lightweight **frontend** to enable instant **cross-device text sharing**. It eliminates the need for sign-ups, logins, or complicated setups. Whether you're switching from phone to laptop or sharing notes quickly, this tool gives you a fast and simple bridge between your devices. Built with a **secure backend**, rate-limiting, and deployed on **Railway**, it's meant for privacy-focused, on-the-go usage.

---

## Tech Stack

### Frontend
- React with TypeScript
- react-router-dom 

### Backend
- Node.js
- TypeScript
- Express.js (assumed based on structure and middleware usage)
- dotenv for environment variable management

### DevOps & Deployment
- Vercel (for frontend hosting and CI/CD)
- Railway (for backend infrastructure and environment management)
- Other Tools: dotenv, rate-limiting middleware, tsconfig, REST API

---

## Visual Overview

A short demo video showcasing how copy-paste.space works:

[Watch Demo on LinkedIn (posted by Mohammed Raashed)](https://www.linkedin.com/posts/mohammed-raashed-b07622255_copy-pastespace-open-source-alternative-activity-7357660963925364737-OtxH)

This video shows how the app allows seamless text sharing across devices in real-time.


---

## Installation Instructions (for Users)

You don’t need to install anything to use this tool.

Just open: [https://copy-paste.space](https://copy-paste.space)  
Paste your text. It will be accessible on any device with the same page open.

---

## Running Locally (for Developers)

To set up and run the project on your local machine:

 1. **Clone the Repository**
  ```bash
  git clone https://github.com/Stephanie322/copy-paste.space.git
  cd copy-paste.space
  ```
2. **Install Dependencies**
  ```bash
   npm install
  ```
3. **Set up Environment Variables**

  Create a .env file based on .example.env and add required variables.

4. **Run the Server**
  ```bash
  npm run dev
  ```
   Make sure you're using a TypeScript-compatible runtime (like Node.js 18+ and ts-node or configured build steps).

