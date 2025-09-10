import { sendMessageToSocket } from "./websocket.js";
import { windowsNodeSockets, browserClientSockets } from "./websocket.js";

export function api(req, res) {
    const [, pathname, nodeID] = req.url.split('/')

    switch (pathname) {
        case 'spawn-chrome':
            {
                const { profile, link } = JSON.parse(req.body);

                const event = JSON.stringify({
                    operation: 'spawn-chrome',
                    link,
                    profile
                });

                sendMessageToSocket(windowsNodeSockets[nodeID], event);
                return res.end(JSON.stringify({ status: "ok" }));
            }

        case 'comment':
            {
                const { comment } = JSON.parse(req.body);

                const event = JSON.stringify({
                    operation: pathname,
                    comment
                })

                sendMessageToSocket(browserClientSockets[nodeID], event);
                return res.end(JSON.stringify({ status: "ok" }));
            }

        default:
            break;
    }
}