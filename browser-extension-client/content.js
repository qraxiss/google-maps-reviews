let socket;
const RECONNECT_DELAY = 1000;

// const URL = 'wss://8cc48cead88b.ngrok-free.app'
const URL = 'ws://localhost:8000'
const ID_URL = (id) => `${URL}/browser-extension/${id}`

function connect() {
    console.log("trying to connect websocket");
    socket = new WebSocket(ID_URL(NODE_ID));

    socket.onopen = () => {
        console.log("websocket connected");
    };

    socket.onmessage = (event) => {
        console.log("event", event.data);

        const data = JSON.parse(event.data)

        switch (data.operation) {
            case 'comment':
                writeComment(data.comment)
                break;

            default:
                break;
        }
    };

    socket.onclose = () => {
        console.log(`websocket disconnected, re-connect in ${RECONNECT_DELAY}ms`);
        setTimeout(connect, RECONNECT_DELAY);
    };
}

connect();