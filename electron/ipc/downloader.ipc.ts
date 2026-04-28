import { ipcMain, BrowserWindow } from 'electron'
import { IPC } from '../../shared/ipc-channels.js'
import { downloaderService } from '../services/downloader.service.js'

export function registerDownloaderHandlers(win: BrowserWindow): void {
  downloaderService.onProgress = (job) => win.webContents.send(IPC.DOWNLOADER.ON_PROGRESS, job)
  downloaderService.onComplete = (job) => win.webContents.send(IPC.DOWNLOADER.ON_COMPLETE, job)
  downloaderService.onError    = (job) => win.webContents.send(IPC.DOWNLOADER.ON_ERROR, job)

  ipcMain.handle(IPC.DOWNLOADER.START,      (_, url, filename) => downloaderService.enqueue(url, filename))
  ipcMain.handle(IPC.DOWNLOADER.CANCEL,     (_, id)            => downloaderService.cancel(id))
  ipcMain.handle(IPC.DOWNLOADER.LIST_QUEUE, ()                 => downloaderService.listQueue())
}
