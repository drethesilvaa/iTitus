import { useEffect } from 'react'
import { useOBSStore } from '../store/obs.store'

export function useOBS() {
  const store = useOBSStore()

  useEffect(() => {
    // Load initial status
    window.electronAPI.obs.getStatus().then(s => {
      if (s.connected) {
        store.setConnected(true)
        store.setStreaming(s.streaming)
        store.setCurrentScene(s.currentScene)
      }
      window.electronAPI.obs.getScenes().then(store.setScenes).catch(() => {})
    }).catch(() => {})

    // Subscribe to push events
    const unsubScene  = window.electronAPI.obs.onSceneChanged(store.setCurrentScene)
    const unsubStream = window.electronAPI.obs.onStreamState(store.setStreaming)
    const unsubConn   = window.electronAPI.obs.onConnected(() => {
      store.setConnected(true)
      window.electronAPI.obs.getScenes().then(store.setScenes).catch(() => {})
      window.electronAPI.obs.getStatus().then(s => store.setCurrentScene(s.currentScene)).catch(() => {})
    })
    const unsubDisc = window.electronAPI.obs.onDisconnected(() => store.setConnected(false))

    return () => {
      unsubScene()
      unsubStream()
      unsubConn()
      unsubDisc()
    }
  }, [])

  return {
    ...store,
    connect:     (host: string, port: number, pass: string) =>
      window.electronAPI.obs.connect(host, port, pass).then(() => store.setConnected(true)).catch(e => store.setError(String(e))),
    disconnect:  () => window.electronAPI.obs.disconnect(),
    switchScene: (scene: string) => window.electronAPI.obs.switchScene(scene),
    startStream: () => window.electronAPI.obs.startStream(),
    stopStream:  () => window.electronAPI.obs.stopStream(),
  }
}
