'use strict';

module.exports = function(config, ircbot) {
	let skipMessages = [];

	ircbot.on('mqttMessage', function (topic, payload) {
		if (topic !== config.topic) {
			return;
		}

		const data = JSON.parse(payload.toString());
		const matchingDevices = config.devices.filter(function(device) {
			return device.protocol === data.protocol &&
				device.numBits === data.numBits &&
				device.value === data.value
		});

		for (const device of matchingDevices) {
			const message = device.message;

			if (skipMessages.indexOf(message) > -1) {
				continue;
			}

			if (device.timeout) {
				(function(message) {
					setTimeout(function() {
						skipMessages = skipMessages.filter(function(skipMessage) {
							return skipMessage !== message;
						});
					}, device.timeout);
				})(message);

				skipMessages.push(message);
			}

			ircbot.notice(config.channel, message);
		}
	});

	ircbot.emit('mqttSubscribe', config.topic);
};
