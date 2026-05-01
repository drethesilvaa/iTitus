import type { Configuration } from 'electron-builder'

const config: Configuration = {
  appId: 'pt.adventistas.paivas.multimedia',
  productName: 'iTitus',
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
    { from: 'assets/icon.ico',       to: 'icon.ico'     },
  ],
  artifactName: '${productName} Setup ${version}.${ext}',
  win: {
    target: [{ target: 'nsis', arch: ['x64'] }],
    icon: 'icon.ico',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    installerLanguages: ['pt_PT'],
    language: '2070',
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    runAfterFinish: false,
    installerSidebar: 'installer-sidebar.bmp',
    installerHeader: 'installer-header.bmp',
  },
  publish: {
    provider: 'github',
    owner: 'drethesilvaa',
    repo: 'iTitus',
    releaseType: 'release',
  },
}

export default config
