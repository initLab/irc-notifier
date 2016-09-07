#!/usr/bin/env node

var irc = require('irc');
var fs = require('fs');
var http = require('http');
var request = require('request');

var control = require('./control');

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

var ircbot = new irc.Client(
	config.irc.server,
	config.irc.nickname,
	config.irc.options
);

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

// misc
ircbot.addListener('action', function(from, to, message) {
    if (to.indexOf('#') === 0 && message === 'kicks ' + config.irc.nickname) {
        ircbot.say(to, 'ouch!');
    }
});

// weather
ircbot.addListener('message', function (from, to, message) {
    if (to !== config.irc.announceChannel) {
        return;
    }
    switch (message) {
        case '!weather':
            request({
                url: 'https://cassie.initlab.org/weather.json',
                json: true
            }, function(error, response, body) {
                if (error !== null || response.statusCode !== 200) {
                    ircbot.say(to, 'Error getting data');
                    return;
                }
                
                ircbot.say(to, 'Temperature: ' + body.temp_in.toFixed(1) + ' °C in / ' + body.temp_out.toFixed(1) + ' °C out');
                ircbot.say(to, 'Humidity: ' + body.hum_in.toFixed(0) + ' % in / ' + body.hum_out.toFixed(0) + ' % out');
                ircbot.say(to, 'Pressure: ' + body.abs_pressure.toFixed(1) + ' hPa');
            });
            break;
        case '!who':
            request({
                url: 'https://fauna.initlab.org/api/users/present.json',
                json: true
            }, function(error, response, body) {
                if (error !== null || response.statusCode !== 200) {
                    ircbot.say(to, 'Error getting data');
                    return;
                }
                var users = body.map(function(user) {
                    return user.name;
                }).join(', ');
                ircbot.say(to, 'People in init Lab: ' + users);
            });
            break;
    }
});

// control socket
var controlSocket = new control.Socket(config.socket.path, ircConnect, function(cmd) {
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
                    ircbot.say(config.irc.announceChannel, 'test');
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
