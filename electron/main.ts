import { app, BrowserWindow, ipcMain, screen } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { IPC } from '../shared/ipc-channels.js'

// Services
import { configStore } from './services/config.service.js'
import { logger } from './services/logger.service.js'
import { vlcService } from './services/vlc.service.js'
import { obsService } from './services/obs.service.js'

// IPC handlers
import { registerOBSHandlers } from './ipc/obs.ipc.js'
import { registerVLCHandlers } from './ipc/vlc.ipc.js'
import { registerDownloaderHandlers } from './ipc/downloader.ipc.js'
import { registerScraperHandlers } from './ipc/scraper.ipc.js'
import { registerAIHandlers } from './ipc/ai.ipc.js'
import { registerConfigHandlers } from './ipc/config.ipc.js'
import { registerFilesHandlers } from './ipc/files.ipc.js'
import { registerLoggerHandlers } from './ipc/logger.ipc.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Single instance lock
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null

function createWindow(): void {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'iTitus — IASD Paivas',
    icon: path.join(process.cwd(), 'assets/icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, '../preload/preload.js'),
    },
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  win.on('closed', () => { win = null })
}

app.whenReady().then(() => {
  createWindow()
  if (!win) return

  // Register all IPC handlers
  registerOBSHandlers(win)
  registerVLCHandlers()
  registerDownloaderHandlers(win)
  registerScraperHandlers()
  registerAIHandlers()
  registerConfigHandlers()
  registerFilesHandlers(win)
  registerLoggerHandlers()

  // App-level IPC
  ipcMain.handle(IPC.APP.VERSION,  () => app.getVersion())
  ipcMain.handle(IPC.APP.MONITORS, () => {
    const primary = screen.getPrimaryDisplay()
    return screen.getAllDisplays().map((d, i) => ({
      index: i,
      label: `Monitor ${i + 1} — ${d.bounds.width}×${d.bounds.height}`,
      isPrimary: d.id === primary.id,
      bounds: d.bounds,
    }))
  })

  // Panic button: stop all running media
  ipcMain.handle(IPC.APP.PANIC, () => {
    vlcService.stop()
    obsService.stopStream().catch(() => {})
    logger.warn('[ACTION] PANIC: todos os média parados')
  })

  // Ping/pong for ESM validation
  ipcMain.handle('ping', () => 'pong')

  // Auto-connect OBS if configured
  if (configStore.get('obsAutoConnect')) {
    const host = configStore.get('obsHost')
    const port = configStore.get('obsPort')
    const pass = configStore.get('obsPassword')
    obsService.connect(host, port, pass).catch(err =>
      logger.error(`Auto-connect OBS falhou: ${err}`)
    )
  }

  logger.info('Aplicação iniciada')
})

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// Auto-start with Windows (minimized if launched at login)
app.setLoginItemSettings({
  openAtLogin: false, // user enables this in settings
  path: process.execPath,
})
