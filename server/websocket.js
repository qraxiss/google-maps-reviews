import crypto from 'crypto'
import { newDevice, updateProfiles } from './database/index.ts';

export const windowsNodeSockets = {}
export const browserClientSockets = {}

export function socketHandler(req, socket) {
    if (req.headers["upgrade"] !== "websocket") {
        socket.end("HTTP/1.1 400 Bad Request");
        return;
    }

    const acceptKey = req.headers["sec-websocket-key"];
    const hash = crypto
        .createHash("sha1")
        .update(acceptKey + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
        .digest("base64");

    const responseHeaders = [
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Accept: ${hash}`
    ];

    socket.write(responseHeaders.join("\r\n") + "\r\n\r\n");

    const [, pathname, id] = req.url.split('/')

    switch (pathname) {
        case 'windows-node':
            windowsNodeSockets[id] = socket

            socket.on("data", (buffer) => {
                const data = JSON.parse(parseSocketMessage(socket, buffer))

                switch (data.operation) {
                    case 'profiles':
                        updateProfiles(id, data.profiles)

                    default:
                        break;
                }
            });

            newDevice(id)
            break;

        case 'browser-extension':
            browserClientSockets[id] = socket
            break;

        default:
            break;
    }

    console.log(`[new-socket][${pathname}][${id}]`)
}

export function parseSocketMessage(socket, buffer) {
    const opcode = buffer[0] & 0x0F;
    if (opcode === 0x8) {
        socket.end();
        return;
    }

    let payloadLength = buffer[1] & 0x7F;
    let maskKeyOffset = 2;

    if (payloadLength === 126) {
        payloadLength = buffer.readUInt16BE(2);
        maskKeyOffset = 4;
    } else if (payloadLength === 127) {
        payloadLength = Number(buffer.readBigUInt64BE(2));
        maskKeyOffset = 10;
    }

    const maskingKey = buffer.subarray(maskKeyOffset, maskKeyOffset + 4);
    const payload = buffer.subarray(maskKeyOffset + 4);

    const unmaskedPayload = Buffer.alloc(payload.length);
    for (let i = 0; i < payload.length; i++) {
        unmaskedPayload[i] = payload[i] ^ maskingKey[i % 4];
    }

    const message = unmaskedPayload.toString("utf8");

    return message
}

export function sendMessageToSocket(socket, message) {
    const payload = Buffer.from(message);
    let header;

    if (payload.length <= 125) {
        header = Buffer.alloc(2);
        header[0] = 0x81;
        header[1] = payload.length;
    } else if (payload.length <= 0xffff) {
        header = Buffer.alloc(4);
        header[0] = 0x81;
        header[1] = 126;
        header.writeUInt16BE(payload.length, 2);
    } else {
        header = Buffer.alloc(10);
        header[0] = 0x81;
        header[1] = 127;
        header.writeBigUInt64BE(BigInt(payload.length), 2);
    }

    const frame = Buffer.concat([header, payload]);
    socket.write(frame);
}

export function onUpgrade(req, socket) {
    socketHandler(req, socket)
}