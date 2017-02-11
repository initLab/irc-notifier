'use strict';

module.exports = function(config, ircbot) {
	ircbot.addListener('action', function(from, to, message) {
		if (to.indexOf('#') === 0 && message === 'kicks ' + ircbot.opt.nickname) {
			ircbot.say(to, 'ouch!');
		}
	});
};
