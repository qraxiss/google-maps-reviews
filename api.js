import fs from 'fs'
import url from 'url'

const indexHTML = fs.readFileSync('./index.html')

export function requestListener(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    switch (req.method) {
        case 'POST':
            res.setHeader("Content-Type", "application/json");
            break;

        case 'GET':
            switch (pathname) {
                case '/':
                    res.end(indexHTML)
                    break;

                default:
                    break;
            }
            break

        default:
            break

    }
};