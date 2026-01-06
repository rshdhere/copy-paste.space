# copy-paste.space

Easily share text snippets and images between your phone, tablet, and computer instantly, without cables or complicated setup.

![Demo](assets/copy-paste.space-demo.gif)

## Introduction

**copy-paste.space** is a minimal web tool built with **TypeScript** and **Node.js**, along with a lightweight frontend for instant cross-device text sharing.  
No sign-ups or logins are required. You can quickly switch between devices or share notes using a secure, rate-limited backend.

---

## Features

- Cross-device support for mobile, tablet, and desktop
- Instant transfer of text and images
- Secure communication with encryption
- No authentication required
- Simple and minimal user experience

---

## How It Works

- Visit https://copy-paste.space on both devices
- Paste text or upload an image
- Instantly access the content on your other device

---

## Tech Stack

### Frontend
- React
- TypeScript
- react-router-dom

### Backend
- Node.js
- TypeScript
- Express.js
- dotenv for environment variable management
- REST APIs

---

## CI/CD Workflow

This project uses **GitHub Actions** for Continuous Integration.

The CI workflow automatically runs on:
- Every push
- Every pull request

The workflow ensures:
- Dependencies install correctly
- Code passes linting checks
- The project builds successfully

This helps maintain code quality and prevents unstable changes from being merged.

---

## Installation

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Git
- MongoDB (for local development)

---

### 1. Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/copy-paste.space.git
   cd copy-paste.space
