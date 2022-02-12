'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo) {
		utils.request.getJson('https://api.sunrise-sunset.org/json?lat=' + config.lat + '&lng=' + config.lng + '&formatted=0', function(data) {
			if (data.status !== 'OK') {
				ircbot.say('Error in response');
				return;
			}

			ircbot.say(replyTo,
				'Date: ' + utils.time.formatDate(data.results.sunset)
			);

			ircbot.say(replyTo,
				'Sunrise: ' + utils.time.formatTime(data.results.sunrise) +
				' / Sunset: ' + utils.time.formatTime(data.results.sunset) +
				' / Solar noon: ' + utils.time.formatTime(data.results.solar_noon)
			);

			ircbot.say(replyTo,
				'Day length: ' + utils.time.formatTimePeriod(data.results.day_length)
			);

			ircbot.say(replyTo,
				'Civil twilight: ' + utils.time.formatTime(data.results.civil_twilight_begin) +
				' - ' + utils.time.formatTime(data.results.civil_twilight_end)
			);

			ircbot.say(replyTo,
				'Nautical twilight: ' + utils.time.formatTime(data.results.nautical_twilight_begin) +
				' - ' + utils.time.formatTime(data.results.nautical_twilight_end)
			);

			ircbot.say(replyTo,
				'Astronomical twilight: ' + utils.time.formatTime(data.results.astronomical_twilight_begin) +
				' - ' + utils.time.formatTime(data.results.astronomical_twilight_end)
			);
		}, function(error) {
			ircbot.say(replyTo, error);
		});
	}

	return {
		key: 'sun',
		description: 'shows sunrise/sunset time',
		execute: execute
	};
};
