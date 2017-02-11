'use strict';

module.exports = function(config, ircbot, utils) {
	let args = Array.prototype.slice.call(arguments, 1);
	args.unshift('modules/commands', config.commands);
	const commands = utils.moduleLoader.apply(utils, args);

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
				command.execute(replyTo, sender, text.substr(commandPrefix.length + 1), commands);
			}
			catch (e) {
				ircbot.say(replyTo, 'Error executing command "' + command.key + '": ' + e.message);
			}
		});
	}
	
	ircbot.addListener('message#', function(sender, to, text) {
		executeCommand(sender, to, text);
	});
	
	ircbot.addListener('pm', function(sender, text) {
		executeCommand(sender, sender, text);
	});
};
