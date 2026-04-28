# Próximos Passos — IASD Paivas Multimedia

## 1. Binários externos (obrigatórios para downloads)

### yt-dlp.exe
- Descarregar de: https://github.com/yt-dlp/yt-dlp/releases/latest
- Ficheiro: `yt-dlp.exe`
- Destino: `resources/yt-dlp.exe`

### ffmpeg.exe
- Descarregar de: https://github.com/BtbN/FFmpeg-Builds/releases
- Escolher: `ffmpeg-n*-win64-lgpl-shared-*.zip` (versão lgpl, win64)
- Extrair apenas `ffmpeg.exe` da pasta `bin/`
- Destino: `resources/ffmpeg.exe`
- **Porquê:** O YouTube serve vídeo e áudio separados para 1080p/4K; o yt-dlp precisa do ffmpeg para os juntar.

## 2. Ícone da aplicação

- Criar ou obter um ficheiro `.ico` (256×256px recomendado)
- Destino: `assets/icon.ico`
- Ferramentas sugeridas: https://www.icoconverter.com ou Adobe Illustrator/Photoshop

## 3. Validar seletores do Scraper

O scraper em `electron/services/scraper.service.ts` usa seletores cheerio que precisam de ser validados contra o HTML real do site.

**Passos:**
1. Abrir no browser: https://recursos.adventistas.org.pt/escolasabatina/videos/
2. Inspecionar a tabela com DevTools (F12 → Elements)
3. Identificar o seletor correto da tabela e dos links de download
4. Actualizar os seletores em `scraper.service.ts` se necessário (actualmente usa `table tr` e `.wp-block-table tr`)

## 4. Primeira execução e configuração

```bash
npm run dev
```

Na app, ir a **Definições** e configurar:

| Definição | Valor |
|-----------|-------|
| OBS Host | `127.0.0.1` |
| OBS Porta | `4455` |
| OBS Password | (conforme configurado no OBS) |
| Pasta de Hinos | Caminho para a pasta com os ficheiros `.mp4` dos hinos |
| Extensão dos Hinos | `mp4` (ou `mkv`, etc.) |
| Pasta de Downloads | Pasta onde guardar os vídeos descarregados |
| Caminho do VLC | `C:\Program Files\VideoLAN\VLC\vlc.exe` |
| Monitor para VLC | Monitor 2 (índice 1) |
| Chave API OpenRouter | Obter em https://openrouter.ai/keys |
| URLs Recursos Web | Actualizar por trimestre |

## 5. Testar o ping/pong (validação ESM)

Abrir DevTools na app (`Ctrl+Shift+I`) e correr na consola:
```javascript
await window.electronAPI  // deve mostrar o objecto com todos os métodos
```

## 6. Build para distribuição

```bash
# Antes do build, garantir que os binários estão em resources/
ls resources/  # deve ter yt-dlp.exe e ffmpeg.exe

npm run dist
# Gera: release/Assistente Multimedia IASD Paivas Setup 1.0.0.exe
```

## 7. Melhorias futuras (backlog)

- [ ] Auto-updater via GitHub Releases (configurar `publish` no `electron-builder.config.ts`)
- [ ] Tema escuro (a estrutura já suporta via `darkMode: 'class'` no Tailwind)
- [ ] Auto-arranque com Windows (activar nas Definições → `app.setLoginItemSettings`)
- [ ] Visualizador de logs na UI (abrir pasta de logs)
- [ ] Suporte a múltiplos perfis de runbook (Escola vs Culto independentes)
- [ ] Notificação Windows quando download completo
- [ ] OBS Request Batching para acções simultâneas (ex: trocar cena + mutar microfone)
