import crypto from 'crypto'


export function socketHandler(req, socket) {
    if (req.headers["upgrade"] !== "websocket") {
        socket.end("HTTP/1.1 400 Bad Request");
        return;
    }

    const acceptKey = req.headers["sec-websocket-key"];
    console.log(acceptKey)
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
    const reply = Buffer.from(message);
    const header = Buffer.alloc(2);
    header[0] = 0x81;
    header[1] = reply.length;
    const responseFrame = Buffer.concat([header, reply]);
    socket.write(responseFrame);
}

export function onUpgrade(req, socket) {
    socketHandler(req, socket)
    socket.on("data", (buffer) => {
        const message = parseSocketMessage(socket, buffer)

        console.log(message)

        switch (message) {
            case 'url':
                sendMessageToSocket(socket, 'get_url')
                break;

            default:
                break;
        }
    });
}