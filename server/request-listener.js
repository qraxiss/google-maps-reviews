import url from 'url'
import { serveStatic } from './serve-static.js'
import { api } from './api.js';

export function requestListener(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    switch (req.method) {
        case 'POST':
            return api(pathname, res)

        case 'GET':
            return serveStatic(pathname, res)
    }
};