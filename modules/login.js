'use strict';

module.exports = function(ircbot, config) {
	if (!('account' in config.irc) || !('username' in config.irc.account) || !('password' in config.irc.account)) {
		return;
	}
	
	ircbot.addListener('registered', function() {
		ircbot.say('USERSERV', 'LOGIN ' + config.irc.account.username + ' ' + config.irc.account.password);
	});
};
