'use strict';

module.exports = {
	key: 'lights',
	description: 'shows lights status',
	execute: function(ircbot, config, from, to) {
		const request = require('request');
		
		request({
			url: 'https://fauna.initlab.org/api/lights/status.json',
			json: true
		}, function(error, response, body) {
			if (error !== null) {
				ircbot.say(to, 'Request error: ' + error.reason);
				return;
			}
			
			if (response && response.statusCode !== 200) {
				ircbot.say(to, 'Error getting data, status code=' + response.statusCode);
				return;
			}
			
			ircbot.say(to, 'Lights are ' + body.status + ', policy is ' + body.policy);
		});
	}
};
