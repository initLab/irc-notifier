'use strict';

module.exports = {
	key: 'weather',
	description: 'shows weather station readings',
	execute: function(ircbot, config, utils, from, to) {
		utils.getJson('https://spitfire.initlab.org/weather.json', function(data) {
			ircbot.say(to, 'Temperature: ' + data.temp_in.toFixed(1) + '°C in / ' + data.temp_out.toFixed(1) + '°C out');
			ircbot.say(to, 'Humidity: ' + data.hum_in.toFixed(0) + '% in / ' + data.hum_out.toFixed(0) + '% out');
			ircbot.say(to, 'Pressure: ' + data.pressure.toFixed(1) + ' hPa');
		}, function(error) {
			ircbot.say(to, error);
		});
	}
};
