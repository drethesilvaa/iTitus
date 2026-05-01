import Store from 'electron-store'
import { shell } from 'electron'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { logger } from './logger.service.js'
import type { YoutubeBroadcast } from '../../shared/electron-api.types.js'

interface YouTubeTokens {
  accessToken: string
  refreshToken: string
  expiryDate: number
  email: string
  clientId: string
  clientSecret: string
}

const tokenStore = new Store<{ tokens: YouTubeTokens | null }>({
  name: 'youtube-tokens',
  defaults: { tokens: null },
})

function findAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = http.createServer()
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as { port: number }
      server.close(() => resolve(addr.port))
    })
    server.on('error', reject)
  })
}

class YouTubeService {
  async authenticate(clientId: string, clientSecret: string): Promise<void> {
    const port = await findAvailablePort()
    const redirectUri = `http://127.0.0.1:${port}`

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/youtube')
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')

    const code = await new Promise<string>((resolve, reject) => {
      let settled = false
      const done = (fn: () => void) => { if (!settled) { settled = true; server.close(); fn() } }

      const timeout = setTimeout(() => done(() => reject(new Error('OAuth timeout após 5 minutos'))), 5 * 60 * 1000)

      const server = http.createServer((req, res) => {
        const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`)
        const code = url.searchParams.get('code')
        const error = url.searchParams.get('error')
        const html = code
          ? '<html><body style="font-family:sans-serif;text-align:center;padding:40px"><h2>✓ Autenticação concluída</h2><p>Pode fechar esta janela.</p></body></html>'
          : `<html><body style="font-family:sans-serif;text-align:center;padding:40px"><h2>✗ Erro: ${error}</h2></body></html>`
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(html)
        clearTimeout(timeout)
        if (code) done(() => resolve(code))
        else done(() => reject(new Error(error ?? 'OAuth error')))
      })

      server.listen(port, '127.0.0.1', () => {
        shell.openExternal(authUrl.toString())
      })

      server.on('error', (err) => done(() => reject(err)))
    })

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
    })
    if (!tokenRes.ok) throw new Error(`Token exchange failed: ${await tokenRes.text()}`)
    const tokens = await tokenRes.json() as { access_token: string; refresh_token: string; expires_in: number }

    // Get account email
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const userInfo = await userRes.json() as { email: string }

    tokenStore.set('tokens', {
      accessToken:  tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate:   Date.now() + tokens.expires_in * 1000,
      email:        userInfo.email,
      clientId,
      clientSecret,
    })
    logger.info(`YouTube autenticado como ${userInfo.email}`)
  }

  disconnect(): void {
    tokenStore.set('tokens', null)
    logger.info('YouTube desligado')
  }

  getAuthStatus(): { connected: boolean; email: string | null } {
    const tokens = tokenStore.get('tokens')
    return { connected: tokens !== null, email: tokens?.email ?? null }
  }

  private async getValidAccessToken(): Promise<string> {
    const tokens = tokenStore.get('tokens')
    if (!tokens) throw new Error('YouTube não autenticado')

    if (Date.now() < tokens.expiryDate - 60_000) return tokens.accessToken

    // Refresh
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: tokens.refreshToken,
        client_id:     tokens.clientId,
        client_secret: tokens.clientSecret,
        grant_type:    'refresh_token',
      }),
    })
    if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`)
    const refreshed = await res.json() as { access_token: string; expires_in: number }

    tokenStore.set('tokens', { ...tokens, accessToken: refreshed.access_token, expiryDate: Date.now() + refreshed.expires_in * 1000 })
    return refreshed.access_token
  }

  async listBroadcasts(): Promise<YoutubeBroadcast[]> {
    const token = await this.getValidAccessToken()

    const fetchPage = async (status: string): Promise<YoutubeBroadcast[]> => {
      const url = new URL('https://www.googleapis.com/youtube/v3/liveBroadcasts')
      url.searchParams.set('part', 'snippet,status')
      url.searchParams.set('broadcastStatus', status)
      url.searchParams.set('broadcastType', 'all')
      url.searchParams.set('maxResults', '10')
      const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`listBroadcasts failed: ${await res.text()}`)
      const data = await res.json() as { items?: unknown[] }
      return (data.items ?? []).map((item: unknown) => {
        const b = item as { id: string; snippet: { title: string; description: string; scheduledStartTime: string; thumbnails?: { default?: { url: string } } }; status: { lifeCycleStatus: string; selfDeclaredMadeForKids?: boolean; madeForKids?: boolean } }
        return {
          id:                 b.id,
          title:              b.snippet.title,
          description:        b.snippet.description,
          thumbnailUrl:       b.snippet.thumbnails?.default?.url ?? '',
          status:             b.status.lifeCycleStatus as YoutubeBroadcast['status'],
          madeForKids:        b.status.selfDeclaredMadeForKids ?? b.status.madeForKids ?? false,
          scheduledStartTime: b.snippet.scheduledStartTime,
        }
      })
    }

    const [upcoming, active] = await Promise.all([fetchPage('upcoming'), fetchPage('active')])
    const seen = new Set<string>()
    return [...active, ...upcoming].filter(b => { if (seen.has(b.id)) return false; seen.add(b.id); return true })
  }

  async updateBroadcast(id: string, metadata: { title?: string; description?: string; madeForKids?: boolean }): Promise<void> {
    const token = await this.getValidAccessToken()

    // Fetch current data to preserve required fields
    const getRes = await fetch(`https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status&id=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!getRes.ok) throw new Error(`Fetch broadcast failed: ${await getRes.text()}`)
    const current = await getRes.json() as { items?: unknown[] }
    const broadcast = current.items?.[0] as { id: string; snippet: Record<string, unknown>; status: Record<string, unknown> } | undefined
    if (!broadcast) throw new Error('Broadcast não encontrado')

    const body = {
      id,
      snippet: {
        ...broadcast.snippet,
        ...(metadata.title       !== undefined && { title:       metadata.title }),
        ...(metadata.description !== undefined && { description: metadata.description }),
      },
      status: {
        ...broadcast.status,
        ...(metadata.madeForKids !== undefined && { selfDeclaredMadeForKids: metadata.madeForKids }),
      },
    }

    const putRes = await fetch('https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!putRes.ok) throw new Error(`Update broadcast failed: ${await putRes.text()}`)
    logger.info(`[ACTION] Transmissão atualizada: ${id}`)
  }

  async setThumbnail(broadcastId: string, filePath: string): Promise<void> {
    const token = await this.getValidAccessToken()
    const ext = path.extname(filePath).toLowerCase()
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg'
    const imageData = fs.readFileSync(filePath)

    const res = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${broadcastId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': mimeType },
      body: imageData,
    })
    if (!res.ok) throw new Error(`Thumbnail upload failed: ${await res.text()}`)
    logger.info(`[ACTION] Thumbnail definido: ${broadcastId}`)
  }
}

export const youtubeService = new YouTubeService()
