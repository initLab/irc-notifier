'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo) {
		for (let ch in config.channels) {
			utils.request.getJson('https://api.thingspeak.com/channels/' + ch + '/feeds.json?days=1&results=1', function(data) {
				if (data.feeds.length === 0) {
					ircbot.say(replyTo, config.channels[ch] + ' - Error: no data');
					return;
				}
				
				ircbot.say(replyTo, config.channels[ch] + ': ' +
					data.channel.field1.substr(0, data.channel.field1.indexOf(':')) +
					': ' + parseFloat(data.feeds[0].field1).toFixed(1) + '°C / ' +
					data.channel.field2.substr(0, data.channel.field2.indexOf(':')) +
					': ' + parseFloat(data.feeds[0].field2).toFixed(1) + '%'
				);
			}, function(error) {
				ircbot.say(replyTo, config.channels[ch] + ' - ' + error);
			});
		}
	}
	
	return {
		key: 'env',
		description: 'shows sensor weather',
		execute: execute
	};
};
