let socket;
const RECONNECT_DELAY = 1000;
const URL = "ws://localhost:8000"

function connect() {
    console.log("trying to connect websocket");
    socket = new WebSocket(URL);

    socket.onopen = () => {
        console.log("websocket connected");
        socket.send('url');
    };

    socket.onmessage = (event) => {
        console.log("event", event.data);
        if (event.data === 'get_url') {
            socket.send(window.location.href);
        }
    };

    socket.onclose = () => {
        console.log(`websocket disconnected, re-connect in ${RECONNECT_DELAY}ms`);
        setTimeout(connect, RECONNECT_DELAY);
    };
}

connect();