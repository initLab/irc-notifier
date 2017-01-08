'use strict';

module.exports = {
	key: 'auth',
	description: 'checks if user is logged in',
	execute: function(ircbot, config, utils, from, to, message) {
		ircbot.remoteWhois(from, function(info) {
			if ('account' in info) {
				if ('secure_connection' in info) {
					ircbot.say(to, from + ' is logged in as ' + info.account + ' and using TLS');
				}
				else {
					ircbot.say(to, from + ' is logged in as ' + info.account + ' and NOT using TLS');
				}
			}
			else {
				ircbot.say(to, from + ' is not logged in');
			}
		});
	}
};
