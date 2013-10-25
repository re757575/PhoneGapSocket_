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

app.get('/snake', function(req, res) {
    res.sendfile(__dirname + '/snake.html');
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
        io.sockets.emit('mobile_action', data); //camera ,beep     
    });

    socket.on('device', function(data) {
        console.log("device: " + data);
        io.sockets.emit('device_info', data);
    });

    socket.on('Record', function(data) {
        console.log("Record: " + data);
        io.sockets.emit('Record_result', data);
    });

    socket.on('acceler', function(data) {
        console.log("acceler: " + data);
        io.sockets.emit('acceler_result', data);
    });


    /* snake game*/
    //form html
    /*
    socket.on('gameReady', function(data) {
        io.sockets.emit('resp_gameReady', "true"); //to mobile
    });

    socket.on('playerConnet', function(data) {
        io.sockets.emit('gameStart', "true");
    });

*/

    socket.on('playerDirection', function(data) {
        console.log(data);

        var xyz = data;
        var x = xyz.split(',')[0];
        var y = xyz.split(',')[1];
         var z= xyz.split(',')[2];
        if (x > 4) {
            io.sockets.emit('move', 'left');
        } else if (x < -4) {
            io.sockets.emit('move', 'right');
        } else if (y > 4) {
            io.sockets.emit('move', 'down');
        } else if (y < -4) {
            io.sockets.emit('move', 'up');
        }
        
        if (z <= -7) {
            io.sockets.emit('move', 'restart');
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
