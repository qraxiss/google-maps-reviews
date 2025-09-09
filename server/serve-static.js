import fs from 'fs'

const indexHTML = fs.readFileSync('../admin-panel/index.html')
const indexCSS = fs.readFileSync('../admin-panel/index.css')
const indexJS = fs.readFileSync('../admin-panel/index.js')

export function serveStatic(pathname, res) {
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