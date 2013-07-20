/*
2013, @muazkh » github.com/muaz-khan
MIT License » https://webrtc-experiment.appspot.com/licence/
Documentation » https://github.com/muaz-khan/WebRTC-Experiment/blob/master/websocket-over-nodejs
Demo » http://websocket-over-nodejs.jit.su/
*/

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({
    port: 8888
});

var CHANNELS = {};

wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        onMessage(JSON.parse(message), ws);
    });
    ws.on('close', function () {
        truncateChannels(ws);
    });
});

function onMessage(message, ws) {
    if (message.checkPresence)
        checkPresence(message, ws);
    else if (message.open)
        onOpen(message, ws);
    else
        sendMessage(message, ws);
}

function onOpen(message, ws) {
    var channel = CHANNELS[message.channel];

    if (channel)
        CHANNELS[message.channel][channel.length] = ws;
    else
        CHANNELS[message.channel] = [ws];
}

function sendMessage(message, ws) {
    message.data = JSON.stringify(message.data);
    var channel = CHANNELS[message.channel];
    if (!channel) return;

    for (var i = 0; i < channel.length; i++) {
        if (channel[i] && channel[i] != ws && channel[i].readyState == 1) {
            try {
                channel[i].send(message.data);
            } catch (e) { }
        }
    }
}

function checkPresence(message, ws) {
    ws.send(JSON.stringify({
        isChannelPresent: !!CHANNELS[message.channel]
    }));
}

function swapArray(arr) {
    var swapped = [],
    length = arr.length;
    for (var i = 0; i < length; i++) {
        if (arr[i])
            swapped[swapped.length] = arr[i];
    }
    return swapped;
}

function truncateChannels(ws) {
    for (var channel in CHANNELS) {
        _channel = CHANNELS[channel];
        for (var i = 0; i < _channel.length; i++) {
            if (_channel[i] == ws)
                delete _channel[i];
        }
        CHANNELS[channel] = swapArray(_channel);
        if (CHANNELS && CHANNELS[channel] && !CHANNELS[channel].length)
            delete CHANNELS[channel];
    }
}
