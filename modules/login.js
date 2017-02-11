'use strict';

module.exports = function(config, ircbot) {
	if (!('username' in config) || !('password' in config)) {
		return;
	}
	
	ircbot.addListener('registered', function() {
		ircbot.say('USERSERV', 'LOGIN ' + config.username + ' ' + config.password);
	});
};
