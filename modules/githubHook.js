'use strict';

const crypto = require('crypto');

module.exports = function(config, ircbot) {
	ircbot.emit('registerHttp', 'post', '/hooks/github', function(req, res) {
		const signature = req.headers['x-hub-signature'];
		const algo = signature.substr(0, signature.indexOf('='));
		
		const expectedSignature = algo + '=' +
			crypto.createHmac(algo, config.secret).update(req.body).digest('hex');
		
		if (signature !== expectedSignature) {
			res.writeHead(400, {
				'Content-Type': 'text/plain'
			});
			res.end('Bad request');
			return;
		}
		
		const event = req.headers['x-github-event'];
		const message = JSON.parse(req.body);
		
		res.writeHead(204, {
			'Content-Type': 'text/plain'
		});
		res.end();
		
		ircbot.say(config.channel, '[' + message.repository.name + '] ' + message.sender.login + ' triggered event ' + event);
	});
};
