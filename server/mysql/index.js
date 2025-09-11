import net from 'net'
import { COM_QUERY, CLIENT_CAPABILITY_FLAGS } from './constants.js'
import {
    calculateToken,
    writePacket,
    isEOF,
    readLengthCodedNumber,
    readLengthCodedString
} from './helpers.js'

export function createClient(config) {
    let state = 'HANDSHAKE';
    let packetBuffer = Buffer.alloc(0);


    const client = new net.Socket();
    let connectedResolve;
    let connectedReject;
    let connected = false;


    const queue = [];
    let current = null;

    function startNextQuery() {
        if (current || queue.length === 0 || state !== 'AUTHENTICATED') return;
        const job = queue.shift();
        current = { ...job, columns: [], rows: [], columnCount: 0 };
        sendQuery(current.sql);
    }

    function sendQuery(sql) {
        state = 'QUERY_AWAIT_RESULT_HEADER';
        const queryPayload = Buffer.alloc(1 + Buffer.byteLength(sql));
        queryPayload.writeUInt8(COM_QUERY, 0);
        queryPayload.write(sql, 1, 'utf8');
        writePacket(client, queryPayload, 0);
    }

    function handleResultHeader(payload) {
        if (!current) return;
        const offset = { pos: 0 };
        const header = readLengthCodedNumber(payload, offset);

        if (header === null) {
            const err = new Error('NULL result header');
            current.reject?.(err);
            current = null;
            return startNextQuery();
        }

        if (header > 0) {
            current.columnCount = header;
            state = 'QUERY_AWAIT_COL_DEF';
        } else {
            const affectedRows = readLengthCodedNumber(payload, offset);
            const insertId = readLengthCodedNumber(payload, offset);
            const result = { affectedRows, insertId };
            current.resolve?.(result);
            current = null;
            startNextQuery();
        }
    }

    function handleColumnDefinition(payload) {
        if (!current) return;
        if (isEOF(payload)) {
            state = 'QUERY_AWAIT_ROW';
            return;
        }

        const offset = { pos: 0 };
        readLengthCodedString(payload, offset);
        readLengthCodedString(payload, offset);
        readLengthCodedString(payload, offset);
        readLengthCodedString(payload, offset);
        const name = readLengthCodedString(payload, offset);
        current.columns.push(name);
    }

    function handleHandshake(payload) {
        let offset = 1;
        while (payload[offset] !== 0) offset++;
        offset++;
        offset += 4;

        const scramble1 = payload.subarray(offset, offset + 8);
        offset += 9;

        offset += 2 + 1 + 2 + 2 + 1 + 10;

        const scramble2 = payload.subarray(offset, offset + 12);
        const scramble = Buffer.concat([scramble1, scramble2]);
        offset += 13;

        const authPluginName = payload.subarray(offset, payload.length - 1).toString('utf8');

        if (authPluginName !== 'caching_sha2_password') {
            const err = new Error('Only caching_sha2_password is supported in this client');
            connectedReject?.(err);
            client.destroy();
            return;
        }

        const token = calculateToken(config.password, scramble);

        const responsePayload = Buffer.alloc(1024);
        let pos = 0;

        responsePayload.writeUInt32LE(CLIENT_CAPABILITY_FLAGS, pos); pos += 4;
        responsePayload.writeUInt32LE(0, pos); pos += 4;
        responsePayload.writeUInt8(45, pos); pos += 1;
        pos += 23;

        responsePayload.write(config.user, pos, 'utf8');
        pos += Buffer.byteLength(config.user, 'utf8');
        responsePayload.writeUInt8(0, pos); pos += 1;

        responsePayload.writeUInt8(token.length, pos); pos += 1;
        token.copy(responsePayload, pos); pos += token.length;

        responsePayload.write(config.database, pos, 'utf8');
        pos += Buffer.byteLength(config.database, 'utf8');
        responsePayload.writeUInt8(0, pos); pos += 1;

        responsePayload.write('caching_sha2_password', pos, 'utf8');
        pos += Buffer.byteLength('caching_sha2_password', 'utf8');
        responsePayload.writeUInt8(0, pos); pos += 1;

        const finalPayload = responsePayload.subarray(0, pos);

        writePacket(client, finalPayload, 1);
        state = 'AUTH_RESPONSE';
    }

    function handleAuthResponse(payload) {
        const marker = payload.readUInt8(0);

        if (marker === 0x00) {
            state = 'AUTHENTICATED';
            connected = true;
            connectedResolve?.();
            startNextQuery();
        } else if (marker === 0xfe) {
            const err = new Error('Auth switch request not supported');
            connectedReject?.(err);
            client.destroy();
        } else if (marker === 0x01) {
            const subMarker = payload.readUInt8(1);
            if (subMarker === 3) {
                state = 'AUTHENTICATED';
                connected = true;
                connectedResolve?.();
                startNextQuery();
            } else {
                const err = new Error(`Auth method 0x01/0x${subMarker.toString(16)} not supported`);
                connectedReject?.(err);
                client.destroy();
            }
        } else {
            const err = new Error(`Authentication failed: 0x${marker.toString(16)}`);
            connectedReject?.(err);
            client.destroy();
        }
    }

    function handleRow(payload) {
        if (!current) return;
        if (isEOF(payload)) {
            const result = current.rows;
            current.resolve?.(result);
            current = null;
            startNextQuery();
            return;
        }

        const row = {};
        const offset = { pos: 0 };
        for (let i = 0; i < current.columnCount; i++) {
            const value = readLengthCodedString(payload, offset);
            row[current.columns[i]] = value;
        }
        current.rows.push(row);
    }

    client.on('data', (data) => {
        packetBuffer = Buffer.concat([packetBuffer, data]);
        while (packetBuffer.length >= 4) {
            const packetLength = packetBuffer.readUIntLE(0, 3);
            const totalPacketLength = packetLength + 4;
            if (packetBuffer.length < totalPacketLength) break;

            const packet = packetBuffer.subarray(0, totalPacketLength);
            packetBuffer = packetBuffer.subarray(totalPacketLength);
            const payload = packet.subarray(4);

            if (state === 'HANDSHAKE') {
                handleHandshake(payload);
            } else if (state === 'AUTH_RESPONSE') {
                handleAuthResponse(payload);
            } else if (state === 'QUERY_AWAIT_RESULT_HEADER') {
                handleResultHeader(payload);
            } else if (state === 'QUERY_AWAIT_COL_DEF') {
                handleColumnDefinition(payload);
            } else if (state === 'QUERY_AWAIT_ROW') {
                handleRow(payload);
            }
        }
    });

    client.on('close', () => {
        connected = false;
    });

    client.on('error', (err) => {
        if (!connected && connectedReject) connectedReject(err);
        if (current && current.reject) current.reject(err);
    });

    return {
        connect() {
            if (connected) return Promise.resolve();
            return new Promise((resolve, reject) => {
                connectedResolve = resolve;
                connectedReject = reject;
                client.connect(config.port, config.host);
            });
        },
        query(sql) {
            return new Promise((resolve, reject) => {
                queue.push({ sql, resolve, reject });
                startNextQuery();
            });
        },
        end() {
            return new Promise((resolve) => {
                client.end(() => resolve());
            });
        }
    };
}

export function createPool(poolConfig) {
    const {
        host,
        port,
        user,
        password,
        database,
        min = 1,
        max = 4,
    } = poolConfig;

    const idle = [];
    const busy = new Set();
    const waitQueue = [];

    async function newConnection() {
        const conn = createClient({ host, port, user, password, database });
        await conn.connect();
        return conn;
    }

    async function acquire() {
        if (idle.length > 0) return idle.pop();
        if (busy.size < max) {
            const conn = await newConnection();
            return conn;
        }
        return new Promise((resolve) => waitQueue.push(resolve));
    }

    function release(conn) {
        busy.delete(conn);
        const next = waitQueue.shift();
        if (next) next(conn); else idle.push(conn);
    }

    async function ensureMin() {
        const target = Math.max(0, Math.min(min, max));
        while (idle.length + busy.size < target) {
            const conn = await newConnection();
            idle.push(conn);
        }
    }

    let initialized = false;

    return {
        async query(sql) {
            console.log(sql)
            if (!initialized) { await ensureMin(); initialized = true; }
            const conn = await acquire();
            busy.add(conn);
            try {
                return await conn.query(sql);
            } finally {
                release(conn);
            }
        },
        async withConnection(fn) {
            if (!initialized) { await ensureMin(); initialized = true; }
            const conn = await acquire();
            busy.add(conn);
            try {
                return await fn(conn);
            } finally {
                release(conn);
            }
        },
        async transaction(fn) {
            return this.withConnection(async (conn) => {
                await conn.query('START TRANSACTION');
                try {
                    const out = await fn(conn);
                    await conn.query('COMMIT');
                    return out;
                } catch (e) {
                    try { await conn.query('ROLLBACK'); } catch { }
                    throw e;
                }
            });
        },
        async end() {
            const conns = [...idle, ...busy];
            idle.length = 0;
            busy.clear();
            await Promise.all(conns.map((c) => c.end()));
        }
    };
}


// pool.query('SELECT 1+1').then(console.log).then(pool.end)

// pool.query('SELECT 1+1').then(console.log).then(pool.end)

