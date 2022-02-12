'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo, sender, text) {
		// SSL is only available for paid accounts
		// noinspection HttpUrlsUsage
		utils.request.getJson('http://ip-api.com/json/' + encodeURIComponent(text), function(data) {
			if (data.status === 'fail') {
				ircbot.say(replyTo, 'Error looking up "' + data.query + '": ' + data.message);
				return;
			}

			ircbot.say(replyTo, data.query + ': ' + data.isp + ' / ' + data.org);
			ircbot.say(replyTo, data.region + ' ' + data.regionName + ', ' + data.zip + ' ' + data.city + ', ' + data.country);
			ircbot.say(replyTo, (data.as.length ? (data.as + ', ') : '') + 'Location: ' + data.lat + ',' + data.lon);
		}, function(error) {
			ircbot.say(replyTo, error);
		});
	}

	return {
		key: 'whois',
		description: 'lookups IP address',
		execute: execute
	};
};
