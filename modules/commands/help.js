'use strict';

module.exports = {
	key: 'help',
	description: 'shows help',
	execute: function(ircbot, config, utils, replyTo, sender, text, commands) {
		ircbot.say(replyTo, 'Available commands: ' + Object.keys(commands).map(function(key) {
			return '!' + commands[key].key + ': ' + commands[key].description;
		}).join(', '));
	}
};
