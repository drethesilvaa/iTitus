export interface MonitorInfo {
  index: number
  label: string
  isPrimary: boolean
  bounds: { x: number; y: number; width: number; height: number }
}

export interface DownloadJob {
  id: string
  url: string
  filename: string
  type: 'youtube' | 'direct'
  status: 'queued' | 'downloading' | 'complete' | 'error' | 'cancelled'
  progress: number
  error?: string
}

export interface ScraperResource {
  title: string
  url: string
  sizeLabel?: string
}

export interface AIChatResult {
  text: string
  actionTaken: string | null
}

export interface AppConfig {
  obsHost: string
  obsPort: number
  obsPassword: string
  obsAutoConnect: boolean
  vlcPath: string
  vlcScreenIndex: number
  downloadPath: string
  openRouterApiKey: string
  openRouterModel: string
  hymnBasePath: string
  hymnExtension: string
  theme: 'light' | 'dark'
  onboardingDone: boolean
  scraperBoletimUrl: string
  scraperMordomiaUrl: string
  scenes: {
    camera: string
    screenShare: string
    screenWithCam: string
    standby: string
  }
  scraperCache: {
    boletim: { items: ScraperResource[]; fetchedAt: number } | null
    mordomia: { items: ScraperResource[]; fetchedAt: number } | null
  }
}

export interface ElectronAPI {
  obs: {
    connect: (host: string, port: number, password: string) => Promise<void>
    disconnect: () => Promise<void>
    switchScene: (scene: string) => Promise<void>
    getScenes: () => Promise<string[]>
    getStatus: () => Promise<{ connected: boolean; streaming: boolean; currentScene: string }>
    startStream: () => Promise<void>
    stopStream: () => Promise<void>
    onSceneChanged: (cb: (scene: string) => void) => () => void
    onStreamState: (cb: (active: boolean) => void) => () => void
    onConnected: (cb: () => void) => () => void
    onDisconnected: (cb: () => void) => () => void
  }
  vlc: {
    play: (filePath: string, screenIndex: number) => Promise<void>
    stop: () => Promise<void>
    getScreens: () => Promise<MonitorInfo[]>
  }
  downloader: {
    start: (url: string, filename: string) => Promise<string>
    cancel: (id: string) => Promise<void>
    listQueue: () => Promise<DownloadJob[]>
    onProgress: (cb: (job: DownloadJob) => void) => () => void
    onComplete: (cb: (job: DownloadJob) => void) => () => void
    onError: (cb: (job: DownloadJob) => void) => () => void
  }
  scraper: {
    fetch: (url: string) => Promise<ScraperResource[]>
  }
  ai: {
    sendMessage: (text: string) => Promise<AIChatResult>
    setApiKey: (key: string) => Promise<void>
    keyStatus: () => Promise<boolean>
    setModel: (model: string) => Promise<void>
    clearHistory: () => Promise<void>
  }
  files: {
    openDialog: (options: { title?: string; filters?: { name: string; extensions: string[] }[] }) => Promise<string | null>
    openPath: (path: string) => Promise<void>
    reveal: (path: string) => Promise<void>
  }
  logger: {
    log: (level: 'info' | 'warn' | 'error', message: string) => void
  }
  config: {
    get: <K extends keyof AppConfig>(key: K) => Promise<AppConfig[K]>
    set: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => Promise<void>
    getAll: () => Promise<AppConfig>
    reset: () => Promise<void>
  }
  app: {
    version: () => Promise<string>
    monitors: () => Promise<MonitorInfo[]>
    panic: () => Promise<void>
    onUpdateAvailable: (cb: (version: string) => void) => () => void
    onUpdateReady: (cb: () => void) => () => void
  }
}
