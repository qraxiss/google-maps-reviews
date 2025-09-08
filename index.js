import http from 'http'
import { requestListener } from './api.js'
import { onUpgrade } from'./socket.js'

// const { requestListener } = require('./api.js')
// const { onUpgrade } = require('./socket.js')

const host = 'localhost';
const port = 8000;

const server = http.createServer(requestListener);

server.on("upgrade", onUpgrade);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});