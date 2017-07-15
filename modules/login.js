'use strict';

module.exports = function(config, ircbot) {
	if (
		!('username' in config) || !config.username ||
		!('password' in config) || !config.password
	) {
		return;
	}
	
	ircbot.addListener('registered', function() {
		ircbot.say('USERSERV', 'LOGIN ' + config.username + ' ' + config.password);
	});
};
