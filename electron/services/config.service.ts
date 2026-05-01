import Store from 'electron-store'
import type { AppConfig } from '../../shared/electron-api.types.js'
import { app } from 'electron'
import path from 'path'
import os from 'os'

const defaults: AppConfig = {
  obsHost:          '127.0.0.1',
  obsPort:          4455,
  obsPassword:      '',
  obsAutoConnect:   false,
  vlcPath:          'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe',
  vlcScreenIndex:   1,
  downloadPath:     path.join(os.homedir(), 'Downloads'),
  openRouterApiKey: '',
  openRouterModel:  'google/gemini-2.0-flash-001',
  hymnBasePath:     '',
  hymnExtension:    'mp4',
  theme:            'dark',
  onboardingDone:   false,
  scraperBoletimUrl:  'https://recursos.adventistas.org.pt/escolasabatina/videos/',
  scraperMordomiaUrl: 'https://recursos.adventistas.org.pt/mordomia/videos/',
  scenes: {
    camera:        'Câmara',
    screenShare:   'Partilha Ecrã',
    screenWithCam: 'Ecrã + Câmara',
    standby:       'StandBy',
  },
  scraperCache: {
    boletim:  null,
    mordomia: null,
  },
  youtubeClientId:     '',
  youtubeClientSecret: '',
}

export const configStore = new Store<AppConfig>({
  name: 'config',
  defaults,
  migrations: {},
})
