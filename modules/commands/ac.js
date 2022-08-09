'use strict';

const DaikinCloud = require("daikin-controller-cloud");
const fs = require("fs");

module.exports = function(config, ircbot, utils) {
	const moduleConfig = {
		keys: ['ac'],
		description: 'shows AC status',
	};

	/**
	 * Options to initialize the DaikinCloud instance with
	 */
	const options = {
		logger: console.log,          // optional, logger function used to log details depending on loglevel
		logLevel: 'info',             // optional, Loglevel of Library, default 'warn' (logs nothing by default)
		communicationTimeout: 10000,  // Amount of ms to wait for request and responses before timeout
		communicationRetries: 3       // Amount of retries when connection timed out
	};

	const tokenSet = utils.file.readJson(config.tokenPath);

	if (!tokenSet) {
		console.error('No token file or invalid tokens: ', config.tokenPath);

		return {
			...moduleConfig,
			execute: () => {},
		};
	}

	const daikinCloud = new DaikinCloud(tokenSet, options);

	// Event that will be triggered on new or updated tokens, save into file
	daikinCloud.on('token_update', tokenSet => {
		console.log(`UPDATED tokens, use for future and wrote to ${config.tokenPath}`);
		fs.writeFileSync(config.tokenPath, JSON.stringify(tokenSet));
	});

	async function execute(replyTo) {
		const devices = await daikinCloud.getCloudDevices();

		if (devices && devices.length) {
			for (let dev of devices) {
				const mode = dev.getData('climateControl', 'operationMode');
				const setPointMode = ['heating', 'cooling', 'auto'].indexOf(mode) > -1 ? mode : 'auto';
				const tempControlPath = '/operationModes/' + setPointMode + '/setpoints/roomTemperature';

				ircbot.say(replyTo,
					dev.getData('climateControl', 'name').value + ': ' +
					(dev.getData('climateControl', 'onOffMode').value ? 'ON' : 'OFF') + ', ' +
					'Mode: ' + dev.getData('climateControl', 'operationMode').value + ', ' +
					'Target: ' + dev.getData('climateControl', 'temperatureControl', tempControlPath).value + '°C, ' +
					'Room temp: ' + dev.getData('climateControl', 'sensoryData', '/roomTemperature').value + '°C, ' +
					'Room humidity: ' + dev.getData('climateControl', 'sensoryData', '/roomHumidity').value + '%, ' +
					'Out temp: ' + dev.getData('climateControl', 'sensoryData', '/outdoorTemperature').value + '°C, ' +
					'Econo: ' +  dev.getData('climateControl', 'econoMode').value + ', ' +
					'Powerful: ' +  dev.getData('climateControl', 'powerfulMode').value + '-' +
					(dev.getData('climateControl', 'isPowerfulModeActive').value ? 'active' : 'inactive')
				);
			}
		} else {
			ircbot.say(replyTo, 'No devices returned');
		}
	}

	return {
		...moduleConfig,
		execute,
	};
};
