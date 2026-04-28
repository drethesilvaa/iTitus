import * as cheerio from 'cheerio'
import { configStore } from './config.service.js'
import { logger } from './logger.service.js'
import type { ScraperResource, AppConfig } from '../../shared/electron-api.types.js'

class ScraperService {
  async fetch(pageUrl: string): Promise<ScraperResource[]> {
    const { default: fetch } = await import('node-fetch')

    logger.info(`Scraper: a carregar ${pageUrl}`)
    const response = await fetch(pageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status} em ${pageUrl}`)

    const html = await response.text()
    const $ = cheerio.load(html)

    const resources: ScraperResource[] = []

    // Parse table rows — selectors validated against recursos.adventistas.org.pt structure
    $('table tr, .wp-block-table tr').each((_, row) => {
      const cells = $(row).find('td')
      if (cells.length < 1) return

      const link = cells.eq(0).find('a[href]')
      const href = link.attr('href') ?? ''
      if (!href) return

      const title = link.attr('title') ?? link.text().trim()
      const sizeLabel = cells.eq(1).text().trim()

      if (title && href) {
        resources.push({ title, url: href, sizeLabel: sizeLabel || undefined })
      }
    })

    // Fallback: try direct link list if table parsing found nothing
    if (resources.length === 0) {
      $('a[href*=".mp4"], a[href*="backblaze"], a[href*="download"]').each((_, el) => {
        const href = $(el).attr('href') ?? ''
        const title = $(el).attr('title') ?? $(el).text().trim()
        if (href && title) resources.push({ title, url: href })
      })
    }

    logger.info(`Scraper: ${resources.length} recursos encontrados`)
    return resources
  }

  async fetchAndCache(
    url: string,
    cacheKey: 'boletim' | 'mordomia'
  ): Promise<ScraperResource[]> {
    const items = await this.fetch(url)
    const cache = configStore.get('scraperCache') as AppConfig['scraperCache']
    configStore.set('scraperCache', {
      ...cache,
      [cacheKey]: { items, fetchedAt: Date.now() },
    })
    return items
  }

  getCached(cacheKey: 'boletim' | 'mordomia'): { items: ScraperResource[]; fetchedAt: number } | null {
    const cache = configStore.get('scraperCache') as AppConfig['scraperCache']
    return cache[cacheKey]
  }
}

export const scraperService = new ScraperService()
