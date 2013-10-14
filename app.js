/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var io = require('socket.io');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
var ip;
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
    ip = getClientIp(req);
    console.log(("IP:" + getClientIp(req) + " connect"));
});

var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

io = io.listen(server);

io.sockets.on('connection', function(socket) {
    socket.on('send', function(data) {
        console.log("已接收data:" + data);
        io.sockets.emit('response', {
            ClientIp: ip,
            _text: data
        });
    });

    socket.on('upload', function(data) {
        console.log("已接收圖片:" + data.img);
        io.sockets.emit('showImg', {
            img: data.img
        });
    });

    socket.on('action', function(data) {
        console.log("action: " + data);

        switch (data) {
            case "camera":
                io.sockets.emit('mobile_action', data);
                break;   
            case "beep":
                io.sockets.emit('mobile_action', data);
                break;                   
        }

    });
});



function getClientIp(req) {
    var ipAddress;
    // The request may be forwarded from local web server.
    var forwardedIpsStr = req.header('x-forwarded-for');
    if (forwardedIpsStr) {
        // 'x-forwarded-for' header may return multiple IP addresses in
        // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
        // the first one
        var forwardedIps = forwardedIpsStr.split(',');
        ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
        // If request was not forwarded
        ipAddress = req.connection.remoteAddress;
    }
    return ipAddress;
};
