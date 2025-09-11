import { loadEnv } from './env.js';
loadEnv()

import http from 'http'
import { requestListener } from './request-listener.js'
import { onUpgrade } from './websocket.js'
import { readSQL } from './mysql/read-sql.js';
import { createPool } from './mysql/index.js'
import './mysql/create-db.js'

const pool = createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    max: 10
})

// pool.query(readSQL('create-persons-table.sql'))
pool.query('SELECT 1+1').then(console.log).then(pool.end)

const host = process.env.APP_HOST;
const port = process.env.APP_PORT;

const server = http.createServer(requestListener);

server.on("upgrade", onUpgrade);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});