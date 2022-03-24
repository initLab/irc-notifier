'use strict';

module.exports = function(config, ircbot, utils) {
	let args = Array.prototype.slice.call(arguments, 1);
	args.unshift('modules/commands', config.commands);
	const commands = utils.moduleLoader.apply(utils, args);

	function executeCommand(sender, replyTo, text) {
		if (!sender || !replyTo) {
			return;
		}

		text = text.trim();

		if (!['!', '.'].includes(text.charAt(0))) {
			return;
		}

		Object.keys(commands).forEach(function(key) {
			const command = commands[key];

			if (!('keys' in command) || !('execute' in command)) {
				return;
			}

			const commandKeys = command.keys.map(key => key.toLowerCase());
			const lowercaseMessage = text.substr(1).toLowerCase();

			for (let commandKey of commandKeys) {
				if (lowercaseMessage === commandKey || lowercaseMessage.indexOf(commandKey + ' ') === 0) {
					try {
						command.execute(replyTo, sender, text.substr(1 + commandKey.length + 1), commands);
					}
					catch (e) {
						ircbot.say(replyTo, 'Error executing command "' + commandKey + '": ' + e.message);
					}
				}
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
