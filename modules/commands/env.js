'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo) {
		utils.request.getJson(config.url, function(data) {
			for (let sensor in config.sensors) {
				const tempKey = sensor + '/temperature';
				const humKey = sensor + '/humidity';
				
				if (!(tempKey in data) || !(humKey in data)) {
					continue;
				}
				
				const temperature = parseFloat(data[tempKey]);
				const humidity = parseFloat(data[humKey]);

				ircbot.say(replyTo, config.sensors[sensor] + ': ' +
					'Temperature: ' + temperature.toFixed(1) + '°C / ' +
					'Humidity: ' + humidity.toFixed(1) + '%'
				);
			}
		}, function(error) {
			ircbot.say(replyTo, 'Env error: ' + error);
		});
	}
	
	return {
		key: 'env',
		description: 'shows sensor readings',
		execute: execute
	};
};
