import http from 'http'
import { Socket } from 'net'

export function createCloseableHttpServer(
  requestListener?: (request: http.IncomingMessage, response: http.ServerResponse) => void,
) {
  let sockets: Record<number, Socket> = {},
    nextSocketId = 0
  const httpServer = http.createServer(requestListener)
  const origClose = httpServer.close
  httpServer.close = (cb?: ((err?: Error | undefined) => void) | undefined) => {
    for (let socketId in sockets) {
      sockets[socketId].destroy()
    }
    return origClose.apply(httpServer, [cb])
  }
  httpServer.on('connection', (socket) => {
    nextSocketId++
    sockets[nextSocketId] = socket
  })
  return httpServer
}
