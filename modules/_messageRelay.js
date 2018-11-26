'use strict';

const net = require('net');

module.exports = function(config, ircbot, utils) {
	let sockets = [];
	
	function sendToSockets(message) {
		for (let i = 0; i < sockets.length; i++) {
			try {
				sockets[i].write(message);
			}
			catch (e) {
				sockets[i] = null;
			}
		}
		
		sockets = sockets.filter(function(socket) {
			return socket !== null;
		});
	}
	
	function messageHandler(delim) {
		return function(sender, to, text) {
			if (config.channels.indexOf(to) === -1) {
				return;
			}
			
			sendToSockets(sender + ' ' + delim + ' ' + text + '\n');
		}
	}
	
	function errorHandler() {
		for (let i = 0; i < sockets.length; i++) {
			if (sockets[i] !== this) {
				continue;
			}
			
			sockets.splice(i, 1);
			break;
		}
	}
	
	ircbot.addListener('message#', messageHandler('m'));
	ircbot.addListener('action', messageHandler('a'));
	ircbot.addListener('notice', messageHandler('n'));
	
	const server = net.createServer(function(socket) {
		socket.on('error', errorHandler);
		sockets.push(socket);
	});
	
	try {
		server.listen(config.listen);
		console.log('[MESSAGERELAY] Listening on ' + config.listen.host + ':' + config.listen.port);
	}
	catch (e) {
		console.error('[MESSAGERELAY] Failed to listen on ' + config.listen.host + ':' + config.listen.port);
	}
};
