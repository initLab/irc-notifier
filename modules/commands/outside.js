'use strict';

module.exports = {
	key: 'outside',
	description: 'shows outside weather',
	execute: function(ircbot, config, utils, from, to) {
		utils.getJson('https://api.thingspeak.com/channels/132452/feeds.json?days=1&results=1', function(data) {
			if (data.feeds.length === 0) {
				ircbot.say(to, 'Error: no data');
				return;
			}
			
			ircbot.say(to, data.channel.field1.substr(0, data.channel.field1.indexOf(':')) +
				': ' + parseFloat(data.feeds[0].field1).toFixed(1) + '°C / ' +
				data.channel.field2.substr(0, data.channel.field2.indexOf(':')) +
				': ' + parseFloat(data.feeds[0].field2).toFixed(1) + '%'
			);
		}, function(error) {
			ircbot.say(to, error);
		});
	}
};
