# Case.ly Frontend

React + TypeScript + Vite frontend for the Case.ly interview platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Browser Requirements

- **Chrome or Edge** (required for Web Speech API)
- Microphone permissions must be granted

## Features

- **Case List:** Browse and select available cases
- **Interview Room:** Real-time voice interview interface
- **Voice Input:** Browser-based speech recognition with silence detection
- **Transcript Display:** Real-time conversation transcript
- **Avatar Placeholder:** Simple visual indicator for agent state

## Development

- Uses Vite for fast HMR
- Tailwind CSS for styling
- TypeScript for type safety
- Web Speech API for voice input
- WebSocket for real-time communication
