'use strict';

function convertDate(date) {
	if (date instanceof Date) {
		return date;
	}

	return new Date(date);
}

function leadingZero(num) {
	if (num > 9) {
		return num;
	}

	return '0' + num;
}

function formatDate(date) {
	date = convertDate(date);

	return leadingZero(date.getDate()) + '.' +
		leadingZero(date.getMonth() + 1) + '.' +
		date.getFullYear();
}

function formatTime(date) {
	date = convertDate(date);

	return leadingZero(date.getHours()) + ':' +
		leadingZero(date.getMinutes()) + ':' +
		leadingZero(date.getSeconds());
}

function formatTimeShort(date) {
	date = convertDate(date);

	return leadingZero(date.getHours()) + ':' +
		leadingZero(date.getMinutes());
}

function formatDateTimeShort(date) {
	date = convertDate(date);

	return (isToday(date) ? '' : (formatDate(date) + ' ')) + formatTimeShort(date);
}

function formatTimePeriod(seconds, shortTexts, suffix) {
	seconds = Math.floor(seconds);
	let minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;
	let hours = Math.floor(minutes / 60);
	minutes -= hours * 60;

	let day_length = [];

	if (hours) {
		day_length.push(hours + (shortTexts ? 'h' : ' hours'));
	}

	if (minutes) {
		day_length.push(minutes + (shortTexts ? 'm' : ' minutes'));
	}

	if (seconds) {
		day_length.push(seconds + (shortTexts ? 's' : ' seconds'));
	}

	if (day_length.length === 0) {
		return 'now';
	}

	let result = day_length.join(' ');

	if (suffix) {
		result += ' ' + suffix;
	}

	return result;
}

function isToday(date) {
	date = convertDate(date);
	const now = new Date;

	return now.getDate() === date.getDate() &&
		now.getMonth() === date.getMonth() &&
		now.getFullYear() === date.getFullYear();
}

module.exports = {
	formatDate: formatDate,
	formatTime: formatTime,
	formatDateTimeShort: formatDateTimeShort,
	formatTimePeriod: formatTimePeriod,
	isToday: isToday
};
