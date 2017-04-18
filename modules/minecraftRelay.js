'use strict';

module.exports = function(config, ircbot) {
	const Rcon = require('rcon');

	const client = new Rcon(config.rcon.host, config.rcon.port, config.rcon.password);
	
	client.on('auth', function() {
		console.log('RCON authentication successful');
	}).on('response', function(str) {
		console.log('RCON got response: ' + str);
	}).on('end', function() {
		console.log('RCON socket closed');
	});

	client.connect();
	
	ircbot.addListener('action', function(from, to, text) {
		if (to !== config.channel) {
			return;
		}
		
		client.send('say * ' + from + ' ' + text);
	});
	
	ircbot.addListener('message' + config.channel, function(from, text) {
		client.send('say <' + from + '> ' + text);
	});
};
