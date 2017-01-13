'use strict';

function leadingZero(num) {
	if (num > 9) {
		return num;
	}
	
	return '0' + num;
}

function log(line) {
	const dt = new Date;
	const args = [line];
	
	args.unshift(
		'[' +
		leadingZero(dt.getDate()) + '.' +
		leadingZero(dt.getMonth() + 1) + '.' +
		(dt.getFullYear()) + ' ' +
		leadingZero(dt.getHours()) + ':' +
		leadingZero(dt.getMinutes()) + ':' +
		leadingZero(dt.getSeconds()) +
		']'
	);
	
	console.log.apply(console, args);
}

module.exports = {
	log: log
};
