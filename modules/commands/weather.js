'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo) {
		utils.request.getJson('https://spitfire.initlab.org/weather.json', function(data) {
			ircbot.say(replyTo, 'Temperature: ' + data.temp_in.toFixed(1) + '°C in / ' + data.temp_out.toFixed(1) + '°C out');
			ircbot.say(replyTo, 'Humidity: ' + data.hum_in.toFixed(0) + '% in / ' + data.hum_out.toFixed(0) + '% out');
			ircbot.say(replyTo, 'Pressure: ' + data.pressure.toFixed(1) + ' hPa');
		}, function(error) {
			ircbot.say(replyTo, error);
		});
	}
	
	return {
		key: 'weather',
		description: 'shows weather station readings',
		execute: execute
	};
};
