'use strict';

module.exports = {
	key: 'auth',
	description: 'checks if user is logged in',
	execute: function(ircbot, config, utils, replyTo, sender) {
		ircbot.remoteWhois(sender, function(info) {
			if ('account' in info) {
				if ('secure_connection' in info) {
					ircbot.say(replyTo, sender + ' is logged in as ' + info.account + ' and using TLS');
				}
				else {
					ircbot.say(replyTo, sender + ' is logged in as ' + info.account + ' and NOT using TLS');
				}
			}
			else {
				ircbot.say(replyTo, sender + ' is not logged in');
			}
		});
	}
};
