'use strict';

module.exports = {
	key: 'help',
	description: 'shows help',
	execute: function(ircbot, config, from, to, message, commands) {
		ircbot.say(to, 'Available commands: ' + Object.keys(commands).map(function(key) {
			return '!' + commands[key].key + ' - ' + commands[key].description;
		}).join(', '));
	}
};
