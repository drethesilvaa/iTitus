import { ipcMain } from 'electron'
import { IPC } from '../../shared/ipc-channels.js'
import { configStore } from '../services/config.service.js'
import type { AppConfig } from '../../shared/electron-api.types.js'

export function registerConfigHandlers(): void {
  ipcMain.handle(IPC.CONFIG.GET, (_, key: keyof AppConfig) => configStore.get(key))
  ipcMain.handle(IPC.CONFIG.SET, (_, key: keyof AppConfig, value: unknown) => configStore.set(key, value))
  ipcMain.handle(IPC.CONFIG.GET_ALL, () => configStore.store)
  ipcMain.handle(IPC.CONFIG.RESET, () => configStore.clear())
}
