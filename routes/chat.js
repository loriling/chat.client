import $F from '../function';
import $WSS from '../chat.wss';
const express = require('express');
const router = express.Router();

router.post('/login', function(req, res, next) {
    let loginName = req.body.loginName;
    let password = req.body.password;
    let ip = $F.getClientIp(req);
    $F.chatService({
        type: 1,//登录请求
        loginName,
        password,
        ip //客户端ip（可选）
    }).then(resp => {
        res.send(resp);
    });
});

//queue up, ready for chat
router.post('/create', function(req, res, next) {
    // req.body.sessionId;
    $WSS.send(req.body.clientId, {
        type: 'create',
        data: req.body
    });
    res.send(JSON.stringify({
        result: 1
    }));
});

// receive messages
router.post('/msg', function(req, res, next) {
    $WSS.send(req.body.clientId, {
        type: 'msg',
        data: req.body
    });
    res.send(JSON.stringify({
        result: 1
    }));
});

// close session
router.post('/close', function(req, res, next) {
    $WSS.send(req.body.clientId, {
        type: 'close',
        data: req.body
    });
    res.send(JSON.stringify({
        result: 1
    }));
});

module.exports = router;