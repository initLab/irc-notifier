'use strict';

module.exports = function(config, ircbot) {
	let lastMessageIndex = null;
	let lastMessageTime = null;

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

		for (const [index, device] of matchingDevices.entries()) {
			if (index !== lastMessageIndex || Date.now() - lastMessageTime > device.timeout) {
				ircbot.notice(config.channel, device.message);
			}

			lastMessageIndex = index;
			lastMessageTime = Date.now();
		}
	});

	ircbot.emit('mqttSubscribe', config.topic);
};
