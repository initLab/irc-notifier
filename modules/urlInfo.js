'use strict';

const { URL } = require('url');

module.exports = function(config, ircbot, utils) {
	ircbot.addListener('message', function(from, to, message) {
		const parts = message.split(' ');

		for (let i = 0; i < parts.length; i++) {
			try {
				const urlObj = new URL(parts[i]);

				utils.request.getWithOptions(urlObj.href, {
					encoding: null
				}, function(data, headers) {
					const matches = utils.http.decodeBuffer(data, headers).match(/<title ?.*?>([^<]*)<\/title>/i);
					
					if (matches && matches[1]) {
						// we have found a title element
						ircbot.say(to, '^ ' + utils.html.decodeEntities(matches[1].trim()) + ' ^');
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
