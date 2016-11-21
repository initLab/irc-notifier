'use strict';

module.exports = {
	key: 'weather',
	description: 'shows weather station readings',
	execute: function(ircbot, config, from, to) {
		const request = require('request');
		
		request({
			url: 'https://spitfire.initlab.org/weather.json',
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
			
			ircbot.say(to, 'Temperature: ' + body.temp_in.toFixed(1) + ' °C in / ' + body.temp_out.toFixed(1) + ' °C out');
			ircbot.say(to, 'Humidity: ' + body.hum_in.toFixed(0) + ' % in / ' + body.hum_out.toFixed(0) + ' % out');
			ircbot.say(to, 'Pressure: ' + body.pressure.toFixed(1) + ' hPa');
		});
	}
};
