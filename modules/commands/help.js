'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo, sender, text, commands) {
		ircbot.say(replyTo, 'Available commands: ' + Object.keys(commands).map(function(key) {
			const command = commands[key];

			if (!('keys' in command) || !('description' in command)) {
				return;
			}

			let keysText = command.keys.join('|');

			if (command.keys.length > 1) {
				keysText = '(' + keysText + ')';
			}

			return '!' + keysText + ': ' + command.description;
		}).join(', '));
	}

	return {
		keys: ['help'],
		description: 'shows help',
		execute: execute
	};
};
