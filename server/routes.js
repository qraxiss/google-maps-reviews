import fs from 'fs'
import url from 'url'
import { sendMessageToSocket, sockets } from './websocket.js'

const indexHTML = fs.readFileSync('../admin-panel/index.html')
const indexCSS = fs.readFileSync('../admin-panel/index.css')
const indexJS = fs.readFileSync('../admin-panel/index.js')



export function requestListener(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    switch (req.method) {
        case 'POST':
            res.setHeader("Content-Type", "application/json");

            switch (pathname) {
                case '/comment':
                    sockets.forEach(socket => {
                        sendMessageToSocket(socket, 'comment')
                    })
                    break;

                default:
                    break;
            }

            break;

        case 'GET':
            switch (pathname) {
                case '/':
                    return res.end(indexHTML)

                case '/index.css':
                    return res.end(indexCSS)

                case '/index.js':
                    return res.end(indexJS)

                default:
                    break;
            }
            break

        default:
            break

    }
};