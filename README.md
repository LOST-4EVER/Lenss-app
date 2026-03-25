# 📸 Lens — Capture Your Daily Journey

**Lens** is a minimal, privacy-focused daily photo journal built with React Native and Expo. It encourages you to capture one moment every day, track your consistency with streaks, and build a beautiful visual history of your life—all while keeping your data 100% on your device.

[![GitHub license](https://img.shields.io/github/license/LOST-4EVER/Lenss-app)](https://github.com/LOST-4EVER/Lenss-app/blob/main/LICENSE)
[![Platform](https://img.shields.io/badge/platform-Android-brightgreen)](https://github.com/LOST-4EVER/Lenss-app)

---

## ✨ Key Features

- **🚀 Fast Daily Capture:** Optimized camera interface to snap your daily photo in seconds.
- **🔥 Streak Counter:** Gamify your habit with a visual streak counter that keeps you motivated.
- **📝 Captions & Moods:** Add context to your memories with daily captions and mood emojis.
- **🖼️ Private Gallery:** A clean, high-performance grid to browse your past memories.
- **🔔 Smart Reminders:** Customizable daily nudges (default 8:00 PM) so you never miss a day.
- **🔒 100% Private & Offline:** No accounts, no cloud sync, and zero tracking. Your photos never leave your device.

---

## 🛠️ Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) via [Expo](https://expo.dev/)
- **Database:** [SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (via `expo-sqlite`) for metadata.
- **Storage:** [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/) for high-resolution image storage.
- **UI & Animations:** [React Native Reanimated](https://www.reanimated.org/), [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/), and [Lucide Icons](https://lucide.dev/).
- **Performance:** [Expo Image](https://docs.expo.dev/versions/latest/sdk/image/) for optimized caching and fast rendering.
- **Notifications:** [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) for local daily reminders.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) app on your Android device.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/LOST-4EVER/Lenss-app.git
   cd Lenss-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run android
   ```

4. **Scan the QR code:** Open the **Expo Go** app on your Android device and scan the QR code shown in your terminal.

---

## 🛡️ Privacy Policy

Lens is designed with privacy as its core principle:
- **No Cloud:** We do not have servers. Your photos are stored in the app's internal directory.
- **No Tracking:** We don't use analytics or tracking SDKs.
- **Local Data:** Streaks and captions are stored in a local SQLite database that only this app can access.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request if you have ideas for new features (like time-lapse generation or biometric lock!).

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️ for a more mindful daily habit.*
