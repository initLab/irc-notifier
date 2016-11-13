'use strict';

module.exports = function(ircbot) {
	ircbot.addListener('error', function(message) {
		console.error('IRCBOT', message);
	});
};
