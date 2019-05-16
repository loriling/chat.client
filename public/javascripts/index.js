const wsAddr = 'ws://127.0.0.1:8888';

class Chat {
    constructor(wsAddr) {
        this.login('test1', '').then(data => {
            if (data.result === 1) {
                this.token = data.token;
                this.clientId = data.clientId;
                this.afterLogin();
            } else {
                console.error('Login failed', data);
            }
        });
    }

    /**
     * 登录操作
     * @param loginName
     * @param password
     * @return {Promise<any>}
     */
    login(loginName, password) {
        return new Promise((resolve, reject) => {
            $.ajax({
                method: 'POST',
                url: '/chat/login',
                data: {
                    loginName,
                    password
                }
            }).done(resp => {
                resolve(resp)
            }).fail(err => {
                reject(err);
            })
        })
    }

    /**
     * 登录成功后，去连接websocket
     */
    afterLogin() {
        this.ws = new WebSocket(wsAddr + '/' + this.clientId);
        this.ws.onopen = () => {
            // websocket连上后就登录
            this.sendRequest(this.token, 2);
        };

        this.ws.onmessage = msg => {
            this.handleMessage(msg);
        };
    }

    handleMessage(msg) {
        console.log(msg.data);
        let message = JSON.parse(msg.data), data = message.data;
        if (message.type === 1000) {
            if (data.result === 1) {//{"type":1000,"data":{"sessionId":96,"agentId":"BOT003","robotType":3,"agentName":"XIAODUO","queueLength":0,"result":1,"message":""}}
                if (data.hasOwnProperty('sessionId')) {
                    this.sessionId = data.sessionId;
                    this.agent = {
                        id: data.agentId,
                        name: data.agentName
                    };
                    // start chatting
                    this.sendMessage(this.token, this.sessionId, '你好');
                } else {
                    // waiting in queue
                }
            }
        } else if (message.type === 'create') {
            if (data.result === 1) {
                this.sessionId = data.sessionId;
                this.agent = {
                    id: data.agentId,
                    name: data.agentName
                };
                this.sendMessage(this.token, this.sessionId, '排队真快~');
            }
        } else if (message.type === 'msg') {
            this.sendMessage(this.token, this.sessionId, data.content);
        }
    }

    send(data) {
        if (typeof data === 'object') {
            data = JSON.stringify(data);
        }
        this.ws.send(data);
    }

    sendRequest(token, queue) {
        this.send({
            type: 1000,//发出聊天的请求
            token: token,//登录成功后获取的token值
            time: new Date().getTime(),//发出请求的时间戳
            queueId: queue,//请求的队列号
            from: "APP",//请求来源，分为:PC MOBILE WECHAT APP 不同来源会让坐席端看到不同客户的默认头像
        });
    }

    sendMessage(token, sessionId, message, extra = '') {
        this.send({
            type: 2001,//发送文本消息请求
            token: token,//登录成功后获取的token值
            sessionId: sessionId,
            time: new Date().getTime(),
            text: message,
            extra: extra
        });
    }
}


const chat = new Chat(wsAddr);