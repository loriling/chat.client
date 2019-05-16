import $F from './function';
const WebSocket = require('ws');

class WebsocketServer {
    wss;
    wsCache = {};
    constructor() {
        this.wss = new WebSocket.Server({
            port: 8888,
            perMessageDeflate: {
                zlibDeflateOptions: {
                    // See zlib defaults.
                    chunkSize: 1024,
                    memLevel: 7,
                    level: 3
                },
                zlibInflateOptions: {
                    chunkSize: 10 * 1024
                },
                // Other options settable:
                clientNoContextTakeover: true, // Defaults to negotiated value.
                serverNoContextTakeover: true, // Defaults to negotiated value.
                serverMaxWindowBits: 10, // Defaults to negotiated value.
                // Below options specified as default values.
                concurrencyLimit: 10, // Limits zlib concurrency for perf.
                threshold: 1024 // Size (in bytes) below which messages
                // should not be compressed.
            }
        });

        this.wss.on('connection', (ws, req) => {
            console.log('wss on connection: ' + req.url);
            if (req.url) {
                let clientId = req.url.substring(1);
                this.wsCache[clientId] = ws;
                ws.on('message', message => {
                    console.log('[ws - on message]', message);
                    if (message) {
                        message = JSON.parse(message);
                        // 调用chat接口
                        $F.chatService(message).then(resp => {
                            console.log('[chat - resp]', resp);
                            ws.send(JSON.stringify({
                                type: message.type,
                                data: resp
                            }));
                        }).catch(err => {
                            console.error(err);
                        });
                    }
                });
            }
        });
    }

    send(clientId, data) {
        if (this.wsCache[clientId]) {
            if (typeof data === 'object') {
                data = JSON.stringify(data);
            }
            this.wsCache[clientId].send(data);
        }
    }
}

const $WSS = new WebsocketServer();
export default $WSS;