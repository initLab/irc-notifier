#!/usr/bin/env node

'use strict';

const irc = require('irc');
const fs = require('fs');
const requireDir = require('require-dir');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const control = ('socket' in config && 'path' in config.socket) ? require('./control') : null;

const ircbot = new irc.Client(
	config.irc.server,
	config.irc.nickname,
	config.irc.options
);

let utils = {};

const modules = requireDir('modules');

Object.keys(modules).forEach(function(key) {
	modules[key](ircbot, config, utils);
});

function ircConnect() {
	ircbot.connect(Math.pow(2, 32) - 1);
}

// control socket
if (!control) {
	ircConnect();
}
else {
	const controlSocket = new control.Socket(config.socket.path, ircConnect, function(line) {
		let args = line.split(' ');
		let cmd = args.shift().toLowerCase();
		
		let argsOptional = false;
		let knownCmd = true;
		let sendCmd = true;
		
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
				const message = args.join(' ');
				
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
}
