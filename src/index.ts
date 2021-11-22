import ejs from 'ejs'
import { existsSync } from 'fs'
import http from 'http'
import { resolve } from 'path'
import URL from 'url'
import { createCloseableHttpServer } from './lib/httpserver.js'
import type { XOR } from './types'

export type EjsTemplateConfig = XOR<{ raw: string }, { path: string }>

export interface EjsTemplateServerOptions {
  /** The (EJS compatible) HTML template to use when rendering the OG image.
   * You must specify *only one* of `raw` and `path`.
   * @see https://ejs.co/
   */
  template: EjsTemplateConfig
  /** The port that the server will try to listen on.
   * @default 8080
   */
  port?: number
  staticParams?: Record<string, string | ((params: unknown) => unknown)>
}

/**
 * Creates a server that is capable of rendering OG images on demand.
 * @param  {EjsTemplateServerOptions} options
 * @async
 * @returns {Promise<http.Server>}
 */
export async function createEjsTemplateServer({
  template,
  port = 8080,
  staticParams,
}: EjsTemplateServerOptions): Promise<http.Server> {
  if (!template.raw && !template.path) {
    throw new Error('No template provided, cannot start OpenGraph server.')
  }

  if (template.path && !existsSync(resolve(template.path))) {
    throw new Error('ENOENT: Invalid path provided, no template was found')
  }

  const handleError = (e: Error, res: http.ServerResponse) => {
    const undefinedError = String(e).match(/.*is not defined/g)
    if (undefinedError) {
      console.error('Received invalid request:', undefinedError)
      res.statusCode = 403
      res.setHeader('Content-Type', 'application/json').end(JSON.stringify(undefinedError))
    } else {
      res.statusCode = 500
      console.error('An error occurred while trying to respond to a request:', e)
      res.setHeader('Content-Type', 'application/json').end(JSON.stringify(e))
    }
  }

  const srv = createCloseableHttpServer(async (req, res) => {
    if (req.url) {
      if (template.path) {
        try {
          const html = await ejs.renderFile(template.path, { ...URL.parse(req.url, true).query, ...staticParams }); // prettier-ignore

          return res.end(html)
        } catch (e: any) {
          handleError(e, res)
        }
      } else if (template.raw) {
        try {
          const html = ejs.render(template.raw, { ...URL.parse(req.url, true).query, ...staticParams }); // prettier-ignore
          return res.end(html)
        } catch (e: any) {
          handleError(e, res)
        }
      }
    } else {
      return res.end('Invalid url.')
    }
  }).listen(port)

  return Promise.resolve(srv)
}
