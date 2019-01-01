'use strict';

module.exports = function(config, ircbot) {
	ircbot.addListener('action', function(from, to, message) {
		if (to.indexOf('#') === 0 && message.indexOf('kicks ' + ircbot.opt.nick) === 0) {
			ircbot.say(to, 'ouch!');
		}
	});
};
