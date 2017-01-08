'use strict';

module.exports = function(ircbot, config, utils) {
	const requireDir = require('require-dir');
	const commands = requireDir('commands');
	
	ircbot.addListener('message', function (from, to, message) {
		if (to !== config.irc.announceChannel) {
			return;
		}
		
		Object.keys(commands).forEach(function(key) {
			const command = commands[key];
			
			if (!('key' in command) || !('execute' in command)) {
				return;
			}
			
			const commandPrefix = '!' + command.key.toLowerCase();
			const lowercaseMessage = message.toLowerCase();
			
			if (lowercaseMessage !== commandPrefix && lowercaseMessage.indexOf(commandPrefix + ' ') !== 0) {
				return;
			}
			
			try {
				command.execute(ircbot, config, utils, from, to, message.substr(commandPrefix.length + 1), commands);
			}
			catch (e) {
				ircbot.say(to, 'Error executing command "' + command.key + '": ' + e.message);
			}
		});
	});
};
