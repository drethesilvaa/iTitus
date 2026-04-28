import YTDlpWrap from 'yt-dlp-wrap'
import { pipeline } from 'stream/promises'
import { createWriteStream } from 'fs'
import path from 'path'
import { app } from 'electron'
import { configStore } from './config.service.js'
import { logger } from './logger.service.js'
import type { DownloadJob } from '../../shared/electron-api.types.js'

// yt-dlp binary: bundled in resources/ for production, local dev path otherwise
function getYtdlpPath(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'yt-dlp.exe')
    : path.join(app.getAppPath(), '..', 'resources', 'yt-dlp.exe')
}

function getFfmpegPath(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'ffmpeg.exe')
    : path.join(app.getAppPath(), '..', 'resources', 'ffmpeg.exe')
}

class DownloaderService {
  private queue: DownloadJob[] = []
  private activeJob: DownloadJob | null = null

  onProgress?: (job: DownloadJob) => void
  onComplete?: (job: DownloadJob) => void
  onError?: (job: DownloadJob) => void

  enqueue(url: string, filename: string): string {
    const id = crypto.randomUUID()
    const type = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('yt.be')
      ? 'youtube'
      : 'direct'
    const job: DownloadJob = { id, url, filename, type, status: 'queued', progress: 0 }
    this.queue.push(job)
    if (!this.activeJob) this.processNext()
    return id
  }

  cancel(id: string): void {
    const idx = this.queue.findIndex(j => j.id === id)
    if (idx !== -1) {
      this.queue[idx].status = 'cancelled'
      this.queue.splice(idx, 1)
    }
  }

  listQueue(): DownloadJob[] {
    return this.activeJob
      ? [this.activeJob, ...this.queue]
      : [...this.queue]
  }

  private async processNext(): Promise<void> {
    if (this.queue.length === 0) { this.activeJob = null; return }
    const job = this.queue.shift()!
    this.activeJob = job
    job.status = 'downloading'

    try {
      if (job.type === 'youtube') {
        await this.downloadYoutube(job)
      } else {
        await this.downloadDirect(job)
      }
      job.status = 'complete'
      job.progress = 100
      this.onComplete?.(job)
      logger.info(`[ACTION] Download concluído: ${job.filename}`)
    } catch (err) {
      job.status = 'error'
      job.error = String(err)
      this.onError?.(job)
      logger.error(`Download falhou (${job.filename}): ${err}`)
    } finally {
      this.activeJob = null
      this.processNext()
    }
  }

  private async downloadYoutube(job: DownloadJob): Promise<void> {
    const ytdlp = new YTDlpWrap(getYtdlpPath())
    const outPath = path.join(configStore.get('downloadPath'), job.filename)

    await new Promise<void>((resolve, reject) => {
      ytdlp.exec([
        job.url,
        '-o', outPath,
        '--format', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        '--ffmpeg-location', getFfmpegPath(),
        '--no-playlist',
      ])
        .on('progress', (p: { percent?: number }) => {
          job.progress = Math.round(p.percent ?? 0)
          this.onProgress?.({ ...job })
        })
        .on('close', resolve)
        .on('error', reject)
    })
  }

  private async downloadDirect(job: DownloadJob): Promise<void> {
    const { default: fetch } = await import('node-fetch')
    const response = await fetch(job.url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const total = Number(response.headers.get('content-length') ?? 0)
    let received = 0
    const outPath = path.join(configStore.get('downloadPath'), job.filename)
    const dest = createWriteStream(outPath)

    if (response.body) {
      response.body.on('data', (chunk: Buffer) => {
        received += chunk.length
        if (total > 0) {
          job.progress = Math.round((received / total) * 100)
          this.onProgress?.({ ...job })
        }
      })
      await pipeline(response.body as NodeJS.ReadableStream, dest)
    }
  }
}

export const downloaderService = new DownloaderService()
