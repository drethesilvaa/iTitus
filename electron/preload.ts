import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/ipc-channels'
import type { ElectronAPI } from '../shared/electron-api.types'

function on(channel: string, cb: (...args: unknown[]) => void): () => void {
  const handler = (_: Electron.IpcRendererEvent, ...args: unknown[]) => cb(...args)
  ipcRenderer.on(channel, handler)
  return () => ipcRenderer.off(channel, handler)
}

const api: ElectronAPI = {
  obs: {
    connect:      (host, port, password) => ipcRenderer.invoke(IPC.OBS.CONNECT, host, port, password),
    disconnect:   ()                     => ipcRenderer.invoke(IPC.OBS.DISCONNECT),
    switchScene:  (scene)                => ipcRenderer.invoke(IPC.OBS.SWITCH_SCENE, scene),
    getScenes:    ()                     => ipcRenderer.invoke(IPC.OBS.GET_SCENES),
    getStatus:    ()                     => ipcRenderer.invoke(IPC.OBS.GET_STATUS),
    startStream:  ()                     => ipcRenderer.invoke(IPC.OBS.START_STREAM),
    stopStream:   ()                     => ipcRenderer.invoke(IPC.OBS.STOP_STREAM),
    onSceneChanged: (cb) => on(IPC.OBS.ON_SCENE_CHANGED, cb as (...args: unknown[]) => void),
    onStreamState:  (cb) => on(IPC.OBS.ON_STREAM_STATE,  cb as (...args: unknown[]) => void),
    onConnected:    (cb) => on(IPC.OBS.ON_CONNECTED,     cb as (...args: unknown[]) => void),
    onDisconnected: (cb) => on(IPC.OBS.ON_DISCONNECTED,  cb as (...args: unknown[]) => void),
  },
  vlc: {
    play:       (filePath, screenIndex) => ipcRenderer.invoke(IPC.VLC.PLAY, filePath, screenIndex),
    stop:       ()                      => ipcRenderer.invoke(IPC.VLC.STOP),
    getScreens: ()                      => ipcRenderer.invoke(IPC.VLC.GET_SCREENS),
  },
  downloader: {
    start:      (url, filename) => ipcRenderer.invoke(IPC.DOWNLOADER.START, url, filename),
    cancel:     (id)            => ipcRenderer.invoke(IPC.DOWNLOADER.CANCEL, id),
    listQueue:  ()              => ipcRenderer.invoke(IPC.DOWNLOADER.LIST_QUEUE),
    onProgress: (cb) => on(IPC.DOWNLOADER.ON_PROGRESS, cb as (...args: unknown[]) => void),
    onComplete: (cb) => on(IPC.DOWNLOADER.ON_COMPLETE, cb as (...args: unknown[]) => void),
    onError:    (cb) => on(IPC.DOWNLOADER.ON_ERROR,    cb as (...args: unknown[]) => void),
  },
  scraper: {
    fetch: (url) => ipcRenderer.invoke(IPC.SCRAPER.FETCH, url),
  },
  ai: {
    sendMessage:  (text)  => ipcRenderer.invoke(IPC.AI.SEND_MESSAGE, text),
    setApiKey:    (key)   => ipcRenderer.invoke(IPC.AI.SET_API_KEY, key),
    keyStatus:    ()      => ipcRenderer.invoke(IPC.AI.KEY_STATUS),
    setModel:     (model) => ipcRenderer.invoke(IPC.AI.SET_MODEL, model),
    clearHistory: ()      => ipcRenderer.invoke(IPC.AI.CLEAR_HISTORY),
  },
  files: {
    openDialog: (options) => ipcRenderer.invoke(IPC.FILES.OPEN_DIALOG, options),
    openPath:   (path)    => ipcRenderer.invoke(IPC.FILES.OPEN_PATH, path),
    reveal:     (path)    => ipcRenderer.invoke(IPC.FILES.REVEAL, path),
  },
  logger: {
    log: (level, message) => ipcRenderer.send(IPC.LOGGER.LOG, level, message),
  },
  config: {
    get:    (key)        => ipcRenderer.invoke(IPC.CONFIG.GET, key),
    set:    (key, value) => ipcRenderer.invoke(IPC.CONFIG.SET, key, value),
    getAll: ()           => ipcRenderer.invoke(IPC.CONFIG.GET_ALL),
    reset:  ()           => ipcRenderer.invoke(IPC.CONFIG.RESET),
  },
  app: {
    version:  ()  => ipcRenderer.invoke(IPC.APP.VERSION),
    monitors: ()  => ipcRenderer.invoke(IPC.APP.MONITORS),
    panic:    ()  => ipcRenderer.invoke(IPC.APP.PANIC),
    onUpdateAvailable: (cb) => on(IPC.APP.ON_UPDATE_AVAILABLE, cb as (...args: unknown[]) => void),
    onUpdateReady:     (cb) => on(IPC.APP.ON_UPDATE_READY,     cb as (...args: unknown[]) => void),
  },
}

contextBridge.exposeInMainWorld('electronAPI', api)
