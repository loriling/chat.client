const express = require('express');
const router = express.Router();

//queue up, ready for chat
router.post('/create', function(req, res, next) {
    res.send('respond with a resource');
});

// receive messages
router.post('/msg', function(req, res, next) {
    res.send('respond with a resource');
});

// close session
router.post('/close', function(req, res, next) {
    res.send('respond with a resource');
});

module.exports = router;