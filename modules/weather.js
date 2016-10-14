module.exports = function(ircbot, config) {
	var request = require('request');
	
	ircbot.addListener('message', function (from, to, message) {
		if (to !== config.irc.announceChannel || message !== '!weather') {
			return;
		}
		
		request({
			url: 'https://cassie.initlab.org/weather.json',
			json: true
		}, function(error, response, body) {
			if (error !== null || response.statusCode !== 200) {
				ircbot.say(to, 'Error getting data, status code=' + response.statusCode);
				return;
			}
			
			ircbot.say(to, 'Temperature: ' + body.temp_in.toFixed(1) + ' °C in / ' + body.temp_out.toFixed(1) + ' °C out');
			ircbot.say(to, 'Humidity: ' + body.hum_in.toFixed(0) + ' % in / ' + body.hum_out.toFixed(0) + ' % out');
			ircbot.say(to, 'Pressure: ' + body.abs_pressure.toFixed(1) + ' hPa');
		});
	});
};
