import { ipcMain, BrowserWindow } from 'electron'
import { IPC } from '../../shared/ipc-channels.js'
import { obsService } from '../services/obs.service.js'

export function registerOBSHandlers(win: BrowserWindow): void {
  obsService.onSceneChanged = (scene) => win.webContents.send(IPC.OBS.ON_SCENE_CHANGED, scene)
  obsService.onStreamState  = (active) => win.webContents.send(IPC.OBS.ON_STREAM_STATE, active)
  obsService.onConnected    = ()       => win.webContents.send(IPC.OBS.ON_CONNECTED)
  obsService.onDisconnected = ()       => win.webContents.send(IPC.OBS.ON_DISCONNECTED)

  ipcMain.handle(IPC.OBS.CONNECT,      (_, host, port, password) => obsService.connect(host, port, password))
  ipcMain.handle(IPC.OBS.DISCONNECT,   ()                        => obsService.disconnect())
  ipcMain.handle(IPC.OBS.SWITCH_SCENE, (_, scene)                => obsService.switchScene(scene))
  ipcMain.handle(IPC.OBS.GET_SCENES,   ()                        => obsService.getScenes())
  ipcMain.handle(IPC.OBS.GET_STATUS,   ()                        => obsService.getStatus())
  ipcMain.handle(IPC.OBS.START_STREAM, ()                        => obsService.startStream())
  ipcMain.handle(IPC.OBS.STOP_STREAM,  ()                        => obsService.stopStream())
}
