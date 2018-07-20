'use strict';

const url = require('url');

module.exports = function(config, ircbot, utils) {
	ircbot.addListener('message', function(from, to, message) {
		const parts = message.split(' ');

		for (let i = 0; i < parts.length; i++) {
			try {
				const urlObj = url.parse(parts[i]);
				utils.request.get(urlObj.href, function(data) {
					const matches = data.match(/<title ?.*?>([^<]*)<\/title>/i);
					
					if (matches && matches[1]) {
						// we have found a title element
						ircbot.say(to, '^ ' + utils.html.decodeEntities(matches[1]) + ' ^');
					}
				}); // request errors are silently discarded
				
				// do not process more urls
				break;
			}
			catch (e) {
				// not a valid url
			}
		}
	});
};
