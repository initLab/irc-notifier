'use strict';

module.exports = function(config, ircbot, utils) {
	ircbot.emit('registerHttp', 'post', '/hooks/github', function(req, res) {
		const crypto = require('crypto');
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
		const payload = JSON.parse(req.body);
		
		res.writeHead(204, {
			'Content-Type': 'text/plain'
		});
		res.end();
		
		ircbot.say(config.channel, utils.githubHook.formatMessage(event, payload));
	});
};
