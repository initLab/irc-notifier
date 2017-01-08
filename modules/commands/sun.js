'use strict';

function leadingZero(num) {
	if (num > 9) {
		return num;
	}
	
	return '0' + num;
}

function formatDate(dateStr) {
	let datetime = new Date(dateStr);
	
	return leadingZero(datetime.getDate()) + '.' +
		leadingZero(datetime.getMonth() + 1) + '.' +
		datetime.getFullYear();
}

function formatTime(dateStr) {
	let datetime = new Date(dateStr);
	
	return leadingZero(datetime.getHours()) + ':' +
		leadingZero(datetime.getMinutes()) + ':' +
		leadingZero(datetime.getSeconds());
}

function formatDayLength(seconds) {
	let minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;
	let hours = Math.floor(minutes / 60);
	minutes -= hours * 60;
	
	let day_length = [];
	
	if (hours) {
		day_length.push(hours + ' hours');
	}

	if (minutes) {
		day_length.push(minutes + ' minutes');
	}

	if (seconds) {
		day_length.push(seconds + ' seconds');
	}
	
	return day_length.join(' ');
}

module.exports = {
	key: 'sun',
	description: 'shows sunrise/sunset time',
	execute: function(ircbot, config, utils, from, to) {
		utils.getJson('http://api.sunrise-sunset.org/json?lat=42.70789247&lng=23.32527086&formatted=0', function(data) {
			if (data.status !== 'OK') {
				ircbot.say('Error in response');
				return;
			}
			
			ircbot.say(to,
				'Date: ' + formatDate(data.results.sunset)
			);
			
			ircbot.say(to,
				'Sunrise: ' + formatTime(data.results.sunrise) +
				' / Sunset: ' + formatTime(data.results.sunset) +
				' / Solar noon: ' + formatTime(data.results.solar_noon)
			);
			
			ircbot.say(to,
				'Day length: ' + formatDayLength(data.results.day_length)
			);
			
			ircbot.say(to, 
				'Civil twilight: ' + formatTime(data.results.civil_twilight_begin) +
				' - ' + formatTime(data.results.civil_twilight_end)
			);
			
			ircbot.say(to, 
				'Nautical twilight: ' + formatTime(data.results.nautical_twilight_begin) +
				' - ' + formatTime(data.results.nautical_twilight_end)
			);
				
			ircbot.say(to, 
				'Astronomical twilight: ' + formatTime(data.results.astronomical_twilight_begin) +
				' - ' + formatTime(data.results.astronomical_twilight_end)
			);
		}, function(error) {
			ircbot.say(to, error);
		});
	}
};
