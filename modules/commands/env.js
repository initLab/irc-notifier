'use strict';

module.exports = function(config, ircbot, utils) {
	const UNITS = {
		'temperature': '°C',
		'humidity': '%'
	};
	
	function execute(replyTo) {
		utils.request.getJson(config.url, function(data) {
			for (let sensor in config.sensors) {
				let values = [];
				
				['temperature', 'humidity'].forEach(function(value) {
					const key = sensor + '/' + value;
					
					if (!(key in data)) {
						return;
					}
					
					const currValue = data[key];
					const label = value[0].toUpperCase() + value.substr(1);
					const delta = Math.max(0, Date.now() - currValue.timestamp) / 1000;
					const formattedTime = utils.time.formatTimePeriod(delta, true, 'ago');
					
					values.push(
						label + ': ' +
						parseFloat(currValue.value).toFixed(1) + UNITS[value] +
						' (' + formattedTime + ')'
					);
				});
				
				if (values.length === 0) {
					continue;
				}
				
				ircbot.say(replyTo, config.sensors[sensor] + ': ' + values.join(' / '));
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
