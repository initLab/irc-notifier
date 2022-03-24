'use strict';

module.exports = function(config, ircbot, utils) {
	const UNITS = {
		'temperature': '°C',
		'humidity': '%',
		'pressure': 'hPa',
		'power': 'W',
		'energy': 'kWh'
	};

	function execute(replyTo) {
		utils.request.getJson(config.url, function(data) {
			for (let sensor in config.sensors) {
				let values = [];

				Object.keys(UNITS).forEach(function(unit) {
					const key = sensor + '/' + unit;

					if (!(key in data)) {
						return;
					}

					const currValue = data[key];
					const label = unit[0].toUpperCase() + unit.substr(1);
					const delta = Math.max(0, Date.now() - currValue.timestamp) / 1000;

					let message = label + ': ' +
						parseFloat(currValue.value).toFixed(1) + UNITS[unit];

					if (delta > config.timeout) {
						message += ' (' + utils.time.formatTimePeriod(delta, true, 'ago') + ')';
					}

					values.push(message);
				});

				if (values.length === 0) {
					continue;
				}

				ircbot.say(replyTo, config.sensors[sensor].name + ': ' + values.join(' / '));
			}
		}, function(error) {
			ircbot.say(replyTo, 'Env error: ' + error);
		});
	}

	return {
		keys: ['env'],
		description: 'shows sensor readings',
		execute: execute
	};
};
