'use strict';

function validateSignature(req, secret) {
	// Allow unsigned webhooks, e.g. for local testing
	if (secret === undefined) {
		return true;
	}

	const crypto = require('crypto');

	if (!('x-hub-signature' in req.headers)) {
		return false;
	}

	const signature = req.headers['x-hub-signature'];
	const algo = signature.substr(0, signature.indexOf('='));

	const expectedSignature = algo + '=' +
		crypto.createHmac(algo, config.secret).update(req.body).digest('hex');

	if (signature !== expectedSignature) {
		return false;
	}

	return true;
}

module.exports = function (config, ircbot, utils) {
	ircbot.emit('registerHttp', 'post', '/hooks/github', function (req, res) {
		if (validateSignature(req, config.secret) !== true) {
			res.writeHead(400, {
				'Content-Type': 'text/plain'
			});
			res.end('Bad request');
			return;
		}

		const event = req.headers['x-github-event'];
		const payload = JSON.parse(req.body);

		res.writeHead(204);
		res.end();

		utils.githubHook.sendMessage(ircbot, utils, config.channel, event, payload);
	});
};
