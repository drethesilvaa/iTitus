import { ipcMain } from 'electron'
import { IPC } from '../../shared/ipc-channels.js'
import { scraperService } from '../services/scraper.service.js'

export function registerScraperHandlers(): void {
  ipcMain.handle(IPC.SCRAPER.FETCH, async (_, url: string, cacheKey?: 'boletim' | 'mordomia') => {
    if (cacheKey) {
      return scraperService.fetchAndCache(url, cacheKey)
    }
    return scraperService.fetch(url)
  })
}
