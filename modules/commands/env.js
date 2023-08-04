'use strict';

module.exports = function(config, ircbot, utils) {
	const UNITS = {
		'temperature': '°C',
		'humidity': '%',
		'pressure': 'hPa',
		'battery': '%',
		'power': 'W',
		'energy': 'kWh'
	};

	const unitKeys = Object.keys(UNITS);
	const sensorPrefixes = Object.keys(config.sensors);
	let lastSensorReadings = [];

	ircbot.on('mqttMessage', function(topic, payload) {
		const matchingSensorKeys = sensorPrefixes.filter(function(prefix) {
			return topic.indexOf(prefix + '/') === 0;
		});

		if (matchingSensorKeys.length === 0) {
			return;
		}

		if (matchingSensorKeys.length > 1) {
			console.warn('More than one matching sensor keys for topic', topic);
			return;
		}

		const prefix = matchingSensorKeys.concat().shift() + '/';
		const {
			timestamp,
			value,
		} = JSON.parse(payload.toString());

		lastSensorReadings.push({
			timestamp,
			prefix: prefix,
			topic: topic,
			unit: topic.substr(prefix.length),
			value,
		});
	});

	for (const prefix of sensorPrefixes) {
		ircbot.emit('mqttSubscribe', prefix + '/#');
	}

	function execute(replyTo) {
		for (const prefix of sensorPrefixes) {
			const prefixWithSlash = prefix + '/';
			const readings = lastSensorReadings.filter(function(reading) {
				return reading.prefix === prefixWithSlash;
			});

			if (readings.length === 0) {
				continue;
			}

			let values = {};

			for (const lastValue of readings) {
				const unit = lastValue.unit;
				const label = unit[0].toUpperCase() + unit.substr(1);
				const delta = Math.max(0, Date.now() - lastValue.timestamp) / 1000;

				let message = label + ': ' +
					parseFloat(lastValue.value).toFixed(1) + UNITS[unit];

				if (delta > config.timeout) {
					message += ' (' + utils.time.formatTimePeriod(delta, true, 'ago') + ')';
				}

				values[unit] = message;
			}

			const orderedValues = Object.entries(values).sort(function (a, b) {
				return unitKeys.indexOf(a[0]) - unitKeys.indexOf(b[0]);
			}).map(function(entry) {
				return entry[1];
			});

			ircbot.say(replyTo, config.sensors[prefix].name + ': ' + orderedValues.join(' / '));
		}
	}

	return {
		keys: ['env'],
		description: 'shows sensor readings',
		execute: execute
	};
};
