var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var chatRouter = require('./routes/chat');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/chat', chatRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


const WebSocket = require('ws');
const fetch = require('node-fetch');

const wss = new WebSocket.Server({
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

const chatAddr = 'http://127.0.0.1:8980/webchat/tpi';

const httpService = (options) => {
  return fetch(options.url, {
    method: options.method,
    headers: options.headers,
    body: options.data,
    credentials: 'include', //'same-origin' 带上cookie
  }).then((response) => {
    return response.json();
  });
};

const chatService = (data) => {
  return httpService({
    url: chatAddr,
    method: 'POST',
    headers: {
      'Content-Type': 'applicatoin/json'
    },
    data: JSON.stringify(data)
  });
};

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('[ws - on message]', message);
    if (message) {
      message = JSON.parse(message);
      chatService(message).then(resp => {
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
});

module.exports = app;
