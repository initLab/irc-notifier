'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo, sender, text, commands) {
		ircbot.say(replyTo, 'Available commands: ' + Object.keys(commands).map(function(key) {
			return '!' + commands[key].key + ': ' + commands[key].description;
		}).join(', '));
	}
	
	return {
		key: 'help',
		description: 'shows help',
		execute: execute
	};
};
