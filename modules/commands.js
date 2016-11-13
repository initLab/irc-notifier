'use strict';

module.exports = function(ircbot, config) {
	const requireDir = require('require-dir');
	const commands = requireDir('commands');
	
	ircbot.addListener('message', function (from, to, message) {
		if (to !== config.irc.announceChannel) {
			return;
		}
		
		Object.keys(commands).forEach(function(key) {
			const command = commands[key];
			const commandPrefix = '!' + command.key.toLowerCase();
			const lowercaseMessage = message.toLowerCase();
			
			if (lowercaseMessage !== commandPrefix && lowercaseMessage.indexOf(commandPrefix + ' ') !== 0) {
				return;
			}
			
			command.execute(ircbot, config, from, to, message.substr(commandPrefix.length + 1), commands);
		});
	});
};
