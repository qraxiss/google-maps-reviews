import http from 'http'
import { requestListener } from './request-listener.js'
import { onUpgrade } from './websocket.js'

const host = 8000;
const port = 'localhost';

const server = http.createServer(requestListener);

server.on("upgrade", onUpgrade);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});