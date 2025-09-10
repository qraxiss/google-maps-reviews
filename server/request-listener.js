import { serveStatic } from './serve-static.js'
import { api } from './api.js';

export function requestListener(req, res) {
    switch (req.method) {
        case 'POST':
            let body = "";
            req.on("data", chunk => {
                body += chunk.toString();
            });

            return req.on("end", () => {
                req.body = body
                return api(req, res)
            })

        case 'GET':
            return serveStatic(req, res)
    }
};