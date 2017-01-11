'use strict';

module.exports = function(ircbot, config, utils) {
	const requireDir = require('require-dir');
	const commands = requireDir('commands');
	
	function executeCommand(sender, replyTo, text) {
		Object.keys(commands).forEach(function(key) {
			const command = commands[key];
			
			if (!('key' in command) || !('execute' in command)) {
				return;
			}

			const commandPrefix = '!' + command.key.toLowerCase();
			const lowercaseMessage = text.toLowerCase();
			
			if (lowercaseMessage !== commandPrefix && lowercaseMessage.indexOf(commandPrefix + ' ') !== 0) {
				return;
			}
			
			try {
				command.execute(ircbot, config, utils, replyTo, sender, text.substr(commandPrefix.length + 1), commands);
			}
			catch (e) {
				ircbot.say(replyTo, 'Error executing command "' + command.key + '": ' + e.message);
			}
		});
	}
	
	ircbot.addListener('message' + config.irc.announceChannel, function(sender, text) {
		executeCommand(sender, config.irc.announceChannel, text);
	});
	
	ircbot.addListener('pm', function(sender, text) {
		executeCommand(sender, sender, text);
	});
};
