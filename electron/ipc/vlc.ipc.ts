import { ipcMain } from 'electron'
import { IPC } from '../../shared/ipc-channels.js'
import { vlcService } from '../services/vlc.service.js'

export function registerVLCHandlers(): void {
  ipcMain.handle(IPC.VLC.PLAY,        (_, filePath, screenIndex) => vlcService.play(filePath, screenIndex))
  ipcMain.handle(IPC.VLC.STOP,        ()                         => vlcService.stop())
  ipcMain.handle(IPC.VLC.GET_SCREENS, ()                         => vlcService.getScreens())
}
