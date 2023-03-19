'use strict';

module.exports = function(config, ircbot) {
	let lastMessageTimestamp = 0;
	let lastMessageRepeats = 0;
	let lastMessageChannel = null;

	setInterval(() => {
		if (lastMessageRepeats === 0 || Date.now() - lastMessageTimestamp < config.repeatTimeout) {
			return;
		}

		if (lastMessageChannel) {
			ircbot.notice(lastMessageChannel, '(last message repeated ' + lastMessageRepeats + ' time' +
				(lastMessageRepeats === 1 ? '' : 's') + ')');
		}

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
			const channel = device.channel || config.channel;

			if (Date.now() - lastMessageTimestamp <= device.timeout) {
				lastMessageChannel = channel;
				lastMessageRepeats++;
			}
			else {
				ircbot.notice(channel, device.message);
				lastMessageRepeats = 0;
			}

			lastMessageTimestamp = Date.now();
		}
	});

	ircbot.emit('mqttSubscribe', config.topic);
};
