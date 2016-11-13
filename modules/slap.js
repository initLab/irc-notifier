'use strict';

module.exports = function(ircbot, config) {
	ircbot.addListener('action', function(from, to, message) {
		if (to.indexOf('#') === 0 && message === 'kicks ' + config.irc.nickname) {
			ircbot.say(to, 'ouch!');
		}
	});
};
