'use strict';

module.exports = {
	key: 'outside',
	description: 'shows outside weather',
	execute: function(ircbot, config, from, to) {
		const request = require('request');
		
		request({
			url: 'https://api.thingspeak.com/channels/132452/feeds.json?days=1&results=1',
			json: true
		}, function(error, response, body) {
			if (error !== null) {
				ircbot.say(to, error.reason ? ('Request error: ' + error.reason) : error.toString());
				return;
			}
			
			if (response && response.statusCode !== 200) {
				ircbot.say(to, 'Error getting data, status code=' + response.statusCode);
				return;
			}
			
			if (body.feeds.length === 0) {
				ircbot.say(to, 'Error: no data');
				return;
			}
			
			ircbot.say(to, body.channel.field1.substr(0, body.channel.field1.indexOf(':')) +
				': ' + parseFloat(body.feeds[0].field1).toFixed(1) + ' °C / ' +
				body.channel.field2.substr(0, body.channel.field2.indexOf(':')) +
				': ' + parseFloat(body.feeds[0].field2).toFixed(1) + ' %'
			);
		});
	}
};
