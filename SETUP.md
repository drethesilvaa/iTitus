# iTitus — Setup Guide

## Required Configuration

These must be set in the app's Settings screen before the app works correctly.

| Setting | Where to get it |
|---|---|
| **OpenRouter API Key** | [openrouter.ai/keys](https://openrouter.ai/keys) — create a free account and generate a key |
| **OBS Password** | OBS → Tools → WebSocket Server Settings → your password |
| **Hymn Base Path** | Full folder path on this PC where hymn video files are stored (e.g. `C:\Videos\Hinos`) |

---

## Defaults to Verify

These have sensible defaults but should be confirmed for your setup.

| Setting | Default | Change if… |
|---|---|---|
| OBS Host | `127.0.0.1` | OBS runs on a different machine |
| OBS Port | `4455` | You changed the OBS WebSocket port |
| VLC Path | `C:\Program Files\VideoLAN\VLC\vlc.exe` | VLC is installed in a different location |
| VLC Screen Index | `1` | You want hymns displayed on a specific monitor (`0` = primary) |
| Download Path | `~/Downloads` | You want downloaded files saved elsewhere |
| OpenRouter Model | `google/gemini-2.0-flash-001` | You want to use a different AI model |
| Hymn Extension | `mp4` | Your hymn files use a different format (e.g. `mkv`, `avi`) |

---

## OBS Scene Names

The scene names in Settings **must match exactly** what you have in OBS (including accents and casing).

| Setting | Default |
|---|---|
| Camera scene | `Câmara` |
| Screen share scene | `Partilha Ecrã` |
| Screen + camera scene | `Ecrã + Câmara` |

If these don't match your OBS scene names, AI scene switching will fail silently.

---

## Scraper URLs

Pre-configured to the Portuguese Adventist resources portal. Only change these if the URLs move.

| Setting | Default |
|---|---|
| Boletim URL | `https://recursos.adventistas.org.pt/escolasabatina/videos/` |
| Mordomia URL | `https://recursos.adventistas.org.pt/mordomia/videos/` |
