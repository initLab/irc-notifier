'use strict';

module.exports = function(config, ircbot, utils) {
	let args = Array.prototype.slice.call(arguments, 1);
	args.unshift('modules/commands', config.commands);
	const commands = utils.moduleLoader.apply(utils, args);

	function executeCommand(sender, replyTo, text) {
		if (!['!', '.'].includes(text.charAt(0))) {
			return;
		}

		Object.keys(commands).forEach(function(key) {
			const command = commands[key];
			
			if (!('key' in command) || !('execute' in command)) {
				return;
			}
			
			const commandKey = command.key.toLowerCase();
			const lowercaseMessage = text.substr(1).toLowerCase();
			
			if (lowercaseMessage !== commandKey && lowercaseMessage.indexOf(commandKey + ' ') !== 0) {
				return;
			}
			
			try {
				command.execute(replyTo, sender, text.substr(1 + command.key.length + 1), commands);
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
