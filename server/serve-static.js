import {readFileSync} from 'fs'

const indexHTML = readFileSync('../admin-panel/index.html')
const indexCSS = readFileSync('../admin-panel/index.css')
const indexJS = readFileSync('../admin-panel/index.js')

export function serveStatic(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

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
}