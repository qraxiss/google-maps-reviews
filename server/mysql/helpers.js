import crypto from 'crypto'

export function xor(a, b) {
    const result = Buffer.alloc(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i] ^ b[i];
    }
    return result;
}

export function calculateToken(password, scramble) {
    if (!password) {
        return Buffer.alloc(0);
    }
    const stage1 = crypto.createHash('sha256').update(password, 'utf8').digest();
    const stage2 = crypto.createHash('sha256').update(stage1).digest();
    const stage3 = crypto.createHash('sha256').update(Buffer.concat([stage2, scramble])).digest();
    return xor(stage1, stage3);
}

export function writePacket(socket, payload, currentSequenceId) {
    const length = payload.length;
    const header = Buffer.alloc(4);
    header.writeUIntLE(length, 0, 3);
    header.writeUInt8(currentSequenceId, 3);
    socket.write(Buffer.concat([header, payload]));
    return currentSequenceId + 1;
}

export function isEOF(payload) {
    return payload[0] === 0xfe && payload.length <= 5;
}

export function readLengthCodedNumber(buffer, offset) {
    const firstByte = buffer[offset.pos];
    offset.pos++;
    if (firstByte < 251) {
        return firstByte;
    }
    if (firstByte === 0xfc) {
        const value = buffer.readUInt16LE(offset.pos);
        offset.pos += 2;
        return value;
    }
    if (firstByte === 0xfd) {
        const value = buffer.readUInt24LE(offset.pos);
        offset.pos += 3;
        return value;
    }
    if (firstByte === 0xfb) {
        return null;
    }
    return -1;
}

export function readLengthCodedString(buffer, offset) {
    const len = readLengthCodedNumber(buffer, offset);
    if (len === null || len === -1) {
        return null;
    }
    const value = buffer.subarray(offset.pos, offset.pos + len).toString('utf8');
    offset.pos += len;
    return value;
}