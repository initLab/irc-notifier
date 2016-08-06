#!/usr/bin/env node

var irc = require('irc');
var fs = require('fs');
var http = require('http');

var control = require('./control');

var server = 'irc.ludost.net';
var nickname = 'initLabNotifier';
var nicknamePassword = fs.readFileSync('nickserv.txt');

var announceChannel = '#initlab';
var socketPath = '/tmp/ircbot.sock';
var pingTimer = null;

var config = {
    autoConnect: false,
    channels: [
        announceChannel
    ],
    debug: true,
    //password: nickname + ' ' + nicknamePassword,
    port: 6697,
    realName: 'init Lab IRC bot',
    secure: true,
    showErrors: true,
    userName: 'ircbot'
};

var ircbot = new irc.Client(server, nickname, config);

// error handler
ircbot.addListener('error', function(message) {
    console.error('IRCBOT', message);
});

// whois
ircbot.addListener('whois', function(info) {
    console.info(info.nick, 'is', info.user + '@' + info.host, '*', info.realname);
    console.info(info.nick, 'on', info.channels.join(' '));
    console.info(info.nick, 'using', info.server, info.serverinfo);
    console.info(info.nick, 'End of /WHOIS list.');
});

// help
ircbot.addListener('raw', function(message) {
    switch (message.rawCommand) {
        case '704':
        case '705':
        case '706':
            console.log(message.args[2]);
        break;
    }
});

// channel list
ircbot.addListener('channellist_start', function() {
    console.info('Listing channels...');
});

ircbot.addListener('channellist_item', function(info) {
    console.info(info.name, info.users, info.topic);
});

function ircConnect() {
	ircbot.connect(Math.pow(2, 32) - 1);
}

// ping
ircbot.addListener('ping', function() {
	if (pingTimer !== null) {
		clearTimeout(pingTimer);
	}

	pingTimer = setTimeout(function() {
		pingTimer = null;
		ircbot.disconnect();
		setTimeout(ircConnect, 10 * 1000);
	}, 30 * 60 * 1000);
});

// misc
ircbot.addListener('action', function(from, to, message) {
    if (to.indexOf('#') === 0 && message === 'kicks ' + nickname) {
        ircbot.say(to, 'ouch!');
    }
});

// control socket
var controlSocket = new control.Socket(socketPath, ircConnect, function(cmd) {
    var args = cmd.split(' ');
    var cmd = args.shift().toLowerCase();
    
    var argsOptional = false;
    var knownCmd = true;
    var sendCmd = true;
    
    switch (cmd) {
        case 'quote':
            cmd = 'send';
        case 'send':
            // no need to modify args
        break;
        case 'join':
            args = [
                args.slice(0, 2).join(' ')
            ];
        break;
        case 'part':
            args.splice(1, args.length - 1, args.slice(1).join(' '));
        break;
        case 'say':
        case 'action':
        case 'notice':
            args.splice(1, args.length - 1, args.slice(1).join(' '));
        break;
        case 'ctcp':
            args.splice(2, args.length - 2, args.slice(2).join(' '));
        break;
        case 'whois':
            args.splice(1, args.length - 1);
        break;
        case 'list':
            argsOptional = true;
        break;
        case 'connect':
        case 'activateFloodProtection':
            argsOptional = true;
            
            if (0 in args) {
                args = [
                    parseInt(args[0])
                ];
            }
        break;
        case 'disconnect':
            if (!ircbot.conn) {
                sendCmd = false;
                break;
            }
            
            argsOptional = true;
            var message = args.join(' ');
            
            if (message.length) {
                args = [
                    message
                ];
            }
            else {
                args = [];
            }
        break;
        default:
            sendCmd = false;
            
            switch (cmd) {
                case 'test':
                    ircbot.say(announceChannel, 'test');
                break;
                case 'exit':
                    if (ircbot.conn) {
                        ircbot.disconnect('Exiting by control socket request', function() {
                            process.exit();
                        });
                    }
                    else {
                        process.exit();
                    }
                break;
                default:
                    knownCmd = false;
                break;
            }
        break;
    }
    
    if (knownCmd) {
        console.info('CMD: got CMD', cmd, 'ARGS', args);
        
        if (sendCmd) {
            if (args.length === 0 && !argsOptional) {
                console.warn('CMD: not enough arguments');
                return;
            }
            
            ircbot[cmd].apply(ircbot, args);
        }
    }
    else {
        console.error('CMD: unknown CMD', cmd, 'ARGS', args);
    }
});
