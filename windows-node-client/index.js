import { randomUUID } from "crypto";

import chrome from './chrome.js'

import { readFileSync, writeFileSync, existsSync } from 'fs'

let socket;
const RECONNECT_DELAY = 1000;
const URL = (id) => `ws://localhost:8000/windows-node/${id}`

if (!existsSync('id.json')) {
    const id = randomUUID()
    writeFileSync('id.json', JSON.stringify(id))
}

const id = JSON.parse(readFileSync('id.json').toString())
const url = URL(id)

// const URL = "wss://c96db2083337.ngrok-free.app"

function connect() {
    console.log("trying to connect websocket");
    socket = new WebSocket(url);

    socket.onopen = () => {
        console.log("websocket connected");
    };

    socket.onmessage = (event) => {
        console.log(event.data)
        const data = JSON.parse(event.data)

        switch (data.operation) {
            case 'spawn-chrome':
                const ID_JS =
                    `console.log('${id}')
window.NODE_ID = '${id}'`

                writeFileSync('../browser-extension-client/id.js', ID_JS)

                chrome.kill()
                chrome.spawn(data.profile, data.link)


                // setTimeout(chrome.kill, 10000)

                break;

            default:
                break;
        }

        console.log(event.data)
    };

    socket.onclose = () => {
        console.log(`websocket disconnected, re-connect in ${RECONNECT_DELAY}ms`);
        setTimeout(connect, RECONNECT_DELAY);
    };
}

connect()

