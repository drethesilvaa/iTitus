# iTitus — IASD Paivas Multimedia Assistant

Windows desktop app (Electron + React) for church multimedia control.

## Stack
- Electron 31.7.7 + electron-vite 3.1.0 + React 18 + TypeScript + Tailwind 3.4
- State: Zustand; IPC: shared/ipc-channels.ts + shared/electron-api.types.ts
- AI: openai SDK pointing at OpenRouter; WebSocket: obs-websocket-js
- Logging: winston + winston-daily-rotate-file; Store: electron-store@11 (ESM)

## Build config rules (do not change these)
- Config file MUST be named `electron.vite.config.ts` (not `vite.config.ts`)
- Main process: ESM output → `out/main/main.mjs`, format: `'es'`
- Preload: CJS output → `out/preload/preload.js`, format: `'cjs'`
- Renderer: `out/renderer/index.html` (not SSR)
- `package.json` `"main"` field: `"out/main/main.mjs"`

## Source layout
```
electron/
  main.ts              # entry point
  preload.ts
  services/            # obs, vlc, ai, downloader, scraper, config, logger
  ipc/                 # one file per service
src/
  App.tsx
  main.tsx
  components/          # layout, runbook, actions, ai, settings, onboarding, instrucoes
  store/               # obs, runbook, chat, settings (Zustand)
  hooks/               # useOBS, useAI
  types/               # obs.types, runbook.types
  constants/           # scenes.constants, runbook.constants
shared/                # ipc-channels.ts, electron-api.types.ts
resources/             # yt-dlp.exe (18 MB), ffmpeg.exe (164 MB static)
assets/                # icon.ico
```

## Dev commands
```
npm run dev       # electron-vite dev (hot reload)
npm run build     # electron-vite build → out/
npm run dist      # build + electron-builder → release/*.exe
npm run dist:dir  # build + electron-builder --dir (unpacked, faster to test)
```

## Key decisions / gotchas
- API key (OpenRouter) lives only in Main process via electron-store, never sent to Renderer
- ffmpeg binary must be the **static** build (BtbN/FFmpeg-Builds win64-lgpl-static) — shared build requires DLLs
- electron-builder `files` must be `out/**/*` (electron-vite outputs to `out/`, not `dist/`)
- Scraper: page cols are col0=title(text), col1=size, col2=link("Descarregar") — link is in col2, not col0
