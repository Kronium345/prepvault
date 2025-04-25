# PrepVault 🎙️

**PrepVault** is an AI-powered mobile and web app designed to help users practice technical interviews through voice interaction. It generates custom interview questions based on role, level, and tech stack, records user answers, and provides instant AI feedback to enhance interview preparation.

---

## 📱 Features

- 🎧 **Voice-Based Interviews**: Speak your answers, no typing required.
- 🧠 **AI-Generated Questions**: Tailored to your role, level, and tech stack.
- 💬 **Instant Feedback**: Receive constructive feedback to improve.
- 🌐 **Cross-Platform**: Works on **web** and **mobile** (iOS/Android) via **Expo**.

---

## 🚀 Tech Stack

- **Frontend**: React Native (with Expo), Expo Router
- **Audio Recording**: `expo-av` for mobile, native `MediaRecorder` API for web
- **Backend**: Node.js + Express (deployed on Render)
- **Transcription**: Google Cloud Speech-to-Text
- **AI Analysis**: Gemini API for feedback & analysis

---

## 🎙️ Audio Recording with `expo-av`

### Web:
- Utilizes **`navigator.mediaDevices.getUserMedia()`** with **`MediaRecorder` API**.
- Records audio as **WebM**.
- Fully functional, records and sends files for transcription.

### Mobile:
- Uses **`expo-av`** with **Audio.Recording** for **.m4a** (AAC) format.
- Currently under **improvement** for better reliability across iOS and Android.
- 📅 **Note (as of 25/04/2025)**: There are known issues with mobile audio transcription (sometimes empty). Fixes are **in progress** and will be updated soon.

---

## 🛠 Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/prepvault.git
   cd prepvault
