const fetch = require('node-fetch');
const chatAddr = 'http://127.0.0.1:8980/webchat/tpi';

export default class $F {
    static httpService(options) {
        return fetch(options.url, {
            method: options.method,
            headers: options.headers,
            body: options.data,
            credentials: 'include', //'same-origin' 带上cookie
        }).then((response) => {
            return response.json();
        });
    };

    static chatService(data){
        return $F.httpService({
            url: chatAddr,
            method: 'POST',
            headers: {
                'Content-Type': 'applicatoin/json'
            },
            data: JSON.stringify(data)
        });
    };

    static getClientIp(req) {
        let ipStr = req.headers['x-forwarded-for'] ||
            req.ip ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress || '';
        const ipReg = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
        if (ipStr.split(',').length > 0) {
            ipStr = ipStr.split(',')[0]
        }
        let ip = ipReg.exec(ipStr);
        return ip[0];
    };
}