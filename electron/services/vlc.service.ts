import { spawn, execSync, ChildProcess } from 'child_process'
import { screen } from 'electron'
import { configStore } from './config.service.js'
import { logger } from './logger.service.js'
import type { MonitorInfo } from '../../shared/electron-api.types.js'

class VLCService {
  private process: ChildProcess | null = null

  async play(filePath: string, screenIndex: number): Promise<void> {
    this.stop()

    const displays = screen.getAllDisplays()
    const target = displays[screenIndex] ?? displays[0]
    const { x, y } = target.bounds

    const vlcPath = configStore.get('vlcPath')
    const args = [
      filePath,
      '--fullscreen',
      `--screen-top=${y}`,
      `--screen-left=${x}`,
      '--no-video-title-show',
      '--no-osd',
      '--play-and-exit',
    ]

    logger.info(`[ACTION] VLC a abrir: ${filePath} no monitor ${screenIndex} (${x},${y})`)

    this.process = spawn(vlcPath, args, { detached: false, stdio: 'ignore' })
    this.process.on('exit', () => {
      this.process = null
      logger.info('VLC terminou')
    })
    this.process.on('error', (err) => {
      this.process = null
      logger.error(`VLC erro: ${err.message}`)
    })
  }

  stop(): void {
    if (this.process) {
      this.process.kill('SIGTERM')
      this.process = null
    }
    // Force-kill any remaining VLC instances on Windows
    try {
      execSync('taskkill /F /IM vlc.exe', { stdio: 'ignore' })
    } catch {
      // Ignore — VLC may not be running
    }
  }

  getScreens(): MonitorInfo[] {
    const primary = screen.getPrimaryDisplay()
    return screen.getAllDisplays().map((d, i) => ({
      index: i,
      label: `Monitor ${i + 1} — ${d.bounds.width}×${d.bounds.height}`,
      isPrimary: d.id === primary.id,
      bounds: d.bounds,
    }))
  }
}

export const vlcService = new VLCService()
