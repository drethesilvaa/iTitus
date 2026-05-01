import { ipcMain } from 'electron'
import { IPC } from '../../shared/ipc-channels.js'
import { youtubeService } from '../services/youtube.service.js'

export function registerYouTubeHandlers(): void {
  ipcMain.handle(IPC.YOUTUBE.AUTHENTICATE,     (_, clientId, clientSecret) => youtubeService.authenticate(clientId, clientSecret))
  ipcMain.handle(IPC.YOUTUBE.DISCONNECT,       ()                           => youtubeService.disconnect())
  ipcMain.handle(IPC.YOUTUBE.GET_AUTH_STATUS,  ()                           => youtubeService.getAuthStatus())
  ipcMain.handle(IPC.YOUTUBE.LIST_BROADCASTS,  ()                           => youtubeService.listBroadcasts())
  ipcMain.handle(IPC.YOUTUBE.UPDATE_BROADCAST, (_, id, metadata)            => youtubeService.updateBroadcast(id, metadata))
  ipcMain.handle(IPC.YOUTUBE.SET_THUMBNAIL,    (_, broadcastId, filePath)   => youtubeService.setThumbnail(broadcastId, filePath))
}
