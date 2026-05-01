import type { Configuration } from 'electron-builder'

const config: Configuration = {
  appId: 'pt.adventistas.paivas.multimedia',
  productName: 'iTitus IASD Paivas',
  copyright: 'IASD Paivas',
  directories: {
    output: 'release',
    buildResources: 'assets',
  },
  files: [
    'out/**/*',
  ],
  extraResources: [
    { from: 'resources/yt-dlp.exe',  to: 'yt-dlp.exe'  },
    { from: 'resources/ffmpeg.exe',  to: 'ffmpeg.exe'   },
  ],
  win: {
    target: [{ target: 'nsis', arch: ['x64'] }],
    icon: 'assets/icon.ico',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    installerLanguages: ['pt_PT'],
    language: '2070',
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    runAfterFinish: false,
  },
  publish: {
    provider: 'github',
    owner: 'drethesilvaa',
    repo: 'iTitus',
    releaseType: 'release',
  },
}

export default config
