import { randomUUID } from "crypto";
import { spawnChrome } from "./spawn-chrome.js";
import { readFileSync, writeFileSync, existsSync } from 'fs'

let socket;
const RECONNECT_DELAY = 1000;
const URL = (id) => `ws://localhost:8000/windows-node/${id}`

if (!existsSync('id.json')) {
    const id = randomUUID()
    writeFileSync('id.json', JSON.stringify(id))
}

const id = readFileSync('id.json').toString()
const url = URL(JSON.parse(id))

// const URL = "wss://c96db2083337.ngrok-free.app"

function connect() {
    console.log("trying to connect websocket");
    socket = new WebSocket(url);

    socket.onopen = () => {
        console.log("websocket connected");
    };

    socket.onmessage = (event) => {
        // spawnChrome('Default', 'https://google.com/maps')
        console.log(event.data)
    };

    socket.onclose = () => {
        console.log(`websocket disconnected, re-connect in ${RECONNECT_DELAY}ms`);
        setTimeout(connect, RECONNECT_DELAY);
    };
}

connect()

