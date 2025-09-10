import { sendMessageToSocket } from "./websocket.js";
import { windowsNodeSockets, browserClientSockets } from "./websocket.js";

export function api(req, res) {
    res.setHeader("Content-Type", "application/json");

    const [, pathname,] = req.url.split('/')

    switch (pathname) {
        case 'spawn-chrome':
            const [, , nodeID] = req.url.split('/')
            const { profile, link } = JSON.parse(req.body);

            const event = JSON.stringify({
                operation: 'spawn-chrome',
                link,
                profile
            });

            sendMessageToSocket(windowsNodeSockets[nodeID], event);
            return res.end(JSON.stringify({ status: "ok" }));

        default:
            break;
    }
}