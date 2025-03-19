# PantryPal

A React Native application that helps you manage your pantry by scanning receipts and automatically adding items to your inventory.

## Features

- Scan receipts using your device's camera
- Upload receipt images from your gallery
- Automatic item extraction using OpenAI's GPT-4 Vision
- Local storage of pantry items
- Cross-platform support (iOS, Android, Web)

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pantrypal.git
cd pantrypal
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```
EXPO_PUBLIC_OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npx expo start
```

5. Run on your preferred platform:
- iOS: Press `i` or scan the QR code with your iPhone's camera
- Android: Press `a` or scan the QR code with your Android device
- Web: Press `w` or open http://localhost:8081 in your browser

## Tech Stack

- React Native
- Expo
- TypeScript
- SQLite (for native platforms)
- OpenAI API
- Expo Camera
- Expo Image Picker

## License

MIT
