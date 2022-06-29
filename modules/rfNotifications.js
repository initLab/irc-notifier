'use strict';

module.exports = function(config, ircbot) {
	let lastMessageTimestamp = 0;
	let lastMessageRepeats = 0;

	setInterval(() => {
		if (lastMessageRepeats === 0 || Date.now() - lastMessageTimestamp < config.repeatTimeout) {
			return;
		}

		ircbot.notice(config.channel, '(last message repeated ' + lastMessageRepeats + ' time' +
			(lastMessageRepeats === 1 ? '' : 's') + ')');
		lastMessageRepeats = 0;
	}, 1000);

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
			if (Date.now() - lastMessageTimestamp <= device.timeout) {
				lastMessageRepeats++;
			}
			else {
				ircbot.notice(config.channel, device.message);
				lastMessageRepeats = 0;
			}

			lastMessageTimestamp = Date.now();
		}
	});

	ircbot.emit('mqttSubscribe', config.topic);
};
