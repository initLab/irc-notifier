'use strict';

const { URL } = require('url');

module.exports = function(config, ircbot, utils) {
	ircbot.addListener('message', function(from, to, message) {
		const parts = message.split(' ');

		for (let i = 0; i < parts.length; i++) {
			try {
				const urlObj = new URL(parts[i]);

				if (!(['http:', 'https:'].includes(urlObj.protocol))) {
					continue;
				}

				utils.request.getWithOptions(urlObj.href, {
					encoding: null,
					headers: {
						'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
					}
				}, function(data, headers) {
					const matches = utils.http.decodeBuffer(data, headers).match(/<title ?.*?>([^<]*)<\/title>/i);

					if (matches && matches[1]) {
						// we have found a title element
						ircbot.say(to, '^ ' + utils.html.decodeEntities(matches[1].trim()).replace('\n', ' ') + ' ^');
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
