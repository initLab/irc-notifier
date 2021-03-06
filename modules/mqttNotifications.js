'use strict';

const mqtt = require('mqtt');

module.exports = function(config, ircbot) {
	const plainParseValue = function(device, rawValue) {
		if (rawValue === device.onValue) {
			return true;
		}

		if (rawValue === device.offValue) {
			return false;
		}

		console.warn('mqtt: undefined value', device.topic, rawValue);
	};

	let devices = [];

	config.devices.forEach(function (item) {
		let device = Object.assign({
			name: 'Unnamed device',
			onValue: true,
			offValue: false,
			onMessage: 'turned on',
			offMessage: 'turned off',
			skipRepeated: false,
		}, item, {
			state: null,
			parseValue: plainParseValue,
			shouldNotify: function(device, rawValue) {
				return true;
			}
		});

		switch (device.type) {
			case 'plain':
				// nothing to do here
				break;
			case 'espurna':
				device.topic = item.prefix + '/relay/' + (device.relayId || 0).toFixed(0);
				device.onValue = '1';
				device.offValue = '0';
				device.skipRepeated = true;
				break;
			case 'netcontrol':
				device.topic = 'NetControl/' + device.subTopic + '/out/ch' + device.channel.toFixed(0);
				device.onValue = 1;
				device.offValue = 0;
				device.parseValue = function(device, rawValue) {
					return plainParseValue(device, JSON.parse(rawValue).value.raw);
				};
				device.shouldNotify = function (device, rawValue) {
					return JSON.parse(rawValue).source !== 'auto';
				}
				break;
			default:
				console.warn('mqtt: unsupported device type', device.type);
				return;
		}

		devices[device.topic] = device;
	});

	const topics = Object.keys(devices);

	const mqttClient = mqtt.connect(config.serverUrl);

	mqttClient.on('message', function (topic, payload) {
		if (topics.indexOf(topic) === -1) {
			console.warn('mqtt: unknown topic', topic);
			return;
		}

		const device = devices[topic];
		const newValue = payload.toString();
		const newState = device.parseValue(device, newValue);

		if (newState === undefined) {
			console.warn('mqtt: failed parsing value', newValue, 'for topic', topic);
			return;
		}

		if (device.state === null) {
			console.info('mqtt: setting initial state', newState, 'for topic', topic);
			device.state = newState;
			return;
		}

		if (newState === device.state) {
			console.info('mqtt: received heartbeat with state', newState, 'for topic', topic);

			if (device.skipRepeated) {
				return;
			}
		}
		else {
			console.info('mqtt: changing state from', device.state, 'to', newState, 'for topic', topic);
			device.state = newState;
		}

		const message = newState ? device.onMessage : device.offMessage;

		if (message === null || !device.shouldNotify(device, newValue)) {
			console.info('mqtt: skipped notification for topic', device.topic, 'state', newState, 'message', message);
			return;
		}

		ircbot.notice(config.channel, device.name + ' ' + message);
	});

	mqttClient.on('connect', function() {
		mqttClient.subscribe(topics);
	});
};
