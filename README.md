# Omarchy + Windows Dual-Boot Setup Guide

An interactive, single-page documentation web app for configuring the **Limine bootloader menu** on Omarchy Linux alongside Windows.

This guide is designed for students to easily configure a **10-second boot selection menu** on startup that lets them choose between Omarchy and Windows.

---

## ✨ Features

- 🎯 **Focused Setup Workflow:** Clear, step-by-step instructions for configuring the default boot menu inside Omarchy.
- ⚡ **Interactive Progress Tracker:** Track completed steps with interactive checkboxes (persisted in `localStorage`).
- 📋 **One-Click Code Copying:** Copy individual terminal commands or copy the entire configuration script at once.
- 🧭 **Sticky Table of Contents (Scrollspy):** Smooth scrolling and active section highlighting.
- 💻 **Terminal Aesthetic:** Dark theme developer UI with high-contrast text, code blocks, ASCII diagrams, and alert callouts.
- 📱 **Fully Responsive:** Collapsible mobile menu drawer for smaller screens.

---

## 🛠️ Quick Start (Development)

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation & Running Locally

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd boot-menu
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Preview production build:
   ```bash
   npm run preview
   ```

---

## 🚀 Key Commands Overview

1. **Find Limine Config:** `sudo find /boot -name 'limine.conf' -print`
2. **Scan for Windows:** `sudo limine-scan`
3. **Verify UEFI Boot Order:** `sudo efibootmgr`
4. **Set UEFI Order (Limine First):** `sudo efibootmgr -o <LIMINE_ID>,<WINDOWS_ID>`
5. **Set 10-Second Menu Timeout:** Edit `/boot/limine.conf` → `timeout: 10`
6. **Reboot:** `sudo reboot`

---

## 📚 Official References

- [Omarchy Dual Boot Manual](https://omarchy.org/manual/dual-boot-install/)
- [Omarchy Getting Started](https://omarchy.org/manual/getting-started/)
- [Omarchy Manual](https://omarchy.org/manual/)

---

## 📄 License

MIT
