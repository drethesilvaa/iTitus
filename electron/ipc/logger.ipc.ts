import { ipcMain } from 'electron'
import { IPC } from '../../shared/ipc-channels.js'
import { logger } from '../services/logger.service.js'

export function registerLoggerHandlers(): void {
  ipcMain.on(IPC.LOGGER.LOG, (_, level: 'info' | 'warn' | 'error', message: string) => {
    logger[level](`[RENDERER] ${message}`)
  })
}
