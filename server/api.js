export function api(pathname, res) {
    res.setHeader("Content-Type", "application/json");

    switch (pathname) {
        case '/comment':
            sockets.forEach(socket => {
                sendMessageToSocket(socket, 'comment')
            })
            break;

        default:
            break;
    }
}