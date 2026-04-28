import { ipcMain } from 'electron'
import { IPC } from '../../shared/ipc-channels.js'
import { aiService } from '../services/ai.service.js'
import { obsService } from '../services/obs.service.js'
import { vlcService } from '../services/vlc.service.js'
import { configStore } from '../services/config.service.js'
import { logger } from '../services/logger.service.js'
import path from 'path'

async function dispatchAction(action: string, params?: Record<string, unknown>): Promise<void> {
  switch (action) {
    case 'SWITCH_SCENE':
      if (params?.scene) await obsService.switchScene(params.scene as string)
      break
    case 'START_STREAM':
      await obsService.startStream()
      break
    case 'STOP_STREAM':
      await obsService.stopStream()
      break
    case 'PLAY_HYMN': {
      const num = params?.number as number
      if (!num) break
      const ext = configStore.get('hymnExtension')
      const base = configStore.get('hymnBasePath')
      const filename = `${String(num).padStart(3, '0')}.${ext}`
      const screenIdx = configStore.get('vlcScreenIndex')
      await vlcService.play(path.join(base, filename), screenIdx)
      break
    }
  }
}

export function registerAIHandlers(): void {
  ipcMain.handle(IPC.AI.SEND_MESSAGE, async (_, message: string) => {
    try {
      // Keep AI informed of current scenes
      const scenes = await obsService.getScenes().catch(() => [])
      aiService.setAvailableScenes(scenes)

      const result = await aiService.sendMessage(message)

      if (result.action) {
        await dispatchAction(result.action.action, result.action.params).catch(err => {
          logger.error(`AI: falha ao executar ação ${result.action!.action}: ${err}`)
        })
      }

      return { text: result.text, actionTaken: result.action?.action ?? null }
    } catch (err) {
      logger.error(`AI: erro ao processar mensagem: ${err}`)
      return { text: `Erro: ${String(err)}`, actionTaken: null }
    }
  })

  ipcMain.handle(IPC.AI.SET_API_KEY, (_, key: string) => {
    configStore.set('openRouterApiKey', key)
    aiService.resetClient()
  })

  ipcMain.handle(IPC.AI.KEY_STATUS, () => {
    return Boolean(configStore.get('openRouterApiKey'))
  })

  ipcMain.handle(IPC.AI.SET_MODEL, (_, model: string) => {
    configStore.set('openRouterModel', model)
  })

  ipcMain.handle(IPC.AI.CLEAR_HISTORY, () => {
    aiService.clearHistory()
  })
}
