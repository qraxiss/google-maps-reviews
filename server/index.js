import http from 'http'
import { requestListener } from './request-listener.js'
import { onUpgrade } from'./websocket.js'
import { loadEnv } from './env.js';

loadEnv()

const host = process.env.APP_HOST;
const port = process.env.APP_PORT;

const server = http.createServer(requestListener);

server.on("upgrade", onUpgrade);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});