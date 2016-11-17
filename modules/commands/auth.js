'use strict';

module.exports = {
	key: 'auth',
	description: 'checks if user is logged in',
	execute: function(ircbot, config, from, to, message) {
		ircbot.whois(from, function(info) {
			if ('account' in info) {
				ircbot.say(to, from + ' is logged in as ' + info.account);
			}
			else {
				ircbot.say(to, from + ' is not logged in');
			}
		});
	}
};
