import http from 'http'
import { requestListener } from './request-listener.js'
import { onUpgrade } from './websocket.js'
import { database } from './database/index.ts'

console.log(database)

const host = 'localhost';
const port = 8000;

const server = http.createServer(requestListener);

server.on("upgrade", onUpgrade);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});