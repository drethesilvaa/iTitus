import OBSWebSocket from 'obs-websocket-js'
import { logger } from './logger.service.js'

type ConnectionParams = { host: string; port: number; password: string }

class OBSService {
  private obs = new OBSWebSocket()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectDelay = 2000
  private lastParams: ConnectionParams | null = null
  private connected = false

  onSceneChanged?: (scene: string) => void
  onStreamState?: (active: boolean) => void
  onConnected?: () => void
  onDisconnected?: () => void

  async connect(host: string, port: number, password: string): Promise<void> {
    this.lastParams = { host, port, password }
    this.reconnectDelay = 2000
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    try {
      await this.obs.connect(`ws://${host}:${port}`, password || undefined)
      this.connected = true
      this.reconnectDelay = 2000
      this.setupEventHandlers()
      this.onConnected?.()
      logger.info(`OBS conectado em ws://${host}:${port}`)
    } catch (err) {
      this.connected = false
      logger.error(`OBS: falha ao ligar — ${err}`)
      throw err
    }
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.lastParams = null
    await this.obs.disconnect()
    this.connected = false
    logger.info('OBS desligado manualmente')
  }

  async switchScene(sceneName: string): Promise<void> {
    await this.obs.call('SetCurrentProgramScene', { sceneName })
    logger.info(`[ACTION] Cena alterada → ${sceneName}`)
  }

  async getScenes(): Promise<string[]> {
    const { scenes } = await this.obs.call('GetSceneList')
    return (scenes as { sceneName: string }[]).map(s => s.sceneName)
  }

  async getStatus(): Promise<{ connected: boolean; streaming: boolean; currentScene: string }> {
    if (!this.connected) return { connected: false, streaming: false, currentScene: '' }
    const [streamStatus, sceneStatus] = await Promise.all([
      this.obs.call('GetStreamStatus'),
      this.obs.call('GetCurrentProgramScene'),
    ])
    return {
      connected: true,
      streaming: streamStatus.outputActive,
      currentScene: sceneStatus.currentProgramSceneName,
    }
  }

  async startStream(): Promise<void> {
    await this.obs.call('StartStream')
    logger.info('[ACTION] Stream iniciado')
  }

  async stopStream(): Promise<void> {
    await this.obs.call('StopStream')
    logger.info('[ACTION] Stream parado')
  }

  private setupEventHandlers(): void {
    this.obs.on('CurrentProgramSceneChanged', ({ sceneName }) => {
      this.onSceneChanged?.(sceneName)
    })
    this.obs.on('StreamStateChanged', ({ outputActive }) => {
      this.onStreamState?.(outputActive)
    })
    this.obs.on('ExitStarted', () => {
      logger.warn('OBS encerrou')
      this.connected = false
      this.onDisconnected?.()
      this.scheduleReconnect()
    })
    this.obs.on('ConnectionClosed', () => {
      if (this.connected) {
        this.connected = false
        this.onDisconnected?.()
        this.scheduleReconnect()
      }
    })
  }

  private scheduleReconnect(): void {
    if (!this.lastParams || this.reconnectTimer) return
    logger.info(`OBS: nova tentativa em ${this.reconnectDelay / 1000}s`)
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null
      if (!this.lastParams) return
      try {
        await this.connect(this.lastParams.host, this.lastParams.port, this.lastParams.password)
      } catch {
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000)
        this.scheduleReconnect()
      }
    }, this.reconnectDelay)
  }
}

export const obsService = new OBSService()
