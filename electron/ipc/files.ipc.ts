import { ipcMain, dialog, shell, BrowserWindow } from 'electron'
import { IPC } from '../../shared/ipc-channels.js'

export function registerFilesHandlers(win: BrowserWindow): void {
  ipcMain.handle(IPC.FILES.OPEN_DIALOG, async (_, options: {
    title?: string
    filters?: { name: string; extensions: string[] }[]
  }) => {
    const result = await dialog.showOpenDialog(win, {
      title: options.title,
      filters: options.filters,
      properties: ['openFile'],
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle(IPC.FILES.OPEN_PATH, (_, filePath: string) => shell.openPath(filePath))
  ipcMain.handle(IPC.FILES.REVEAL,    (_, filePath: string) => shell.showItemInFolder(filePath))
}
