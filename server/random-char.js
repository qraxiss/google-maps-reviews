import { randomBytes } from 'crypto'


export function randomChar() {
    return randomBytes(16).toString("hex");
}