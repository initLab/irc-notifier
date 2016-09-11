#!/usr/bin/env node

var irc = require('irc');
var fs = require('fs');
var http = require('http');
var request = require('request');
var requireDir = require('require-dir');

var control = require('./control');

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

var ircbot = new irc.Client(
	config.irc.server,
	config.irc.nickname,
	config.irc.options
);

var modules = requireDir('modules');

Object.keys(modules).forEach(function(key) {
	modules[key](ircbot, config);
});

function ircConnect() {
	ircbot.connect(Math.pow(2, 32) - 1);
}

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
