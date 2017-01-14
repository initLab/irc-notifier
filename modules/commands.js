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
	
	function bindEvents() {
		ircbot.addListener('message' + config.irc.announceChannel, function(sender, text) {
			executeCommand(sender, config.irc.announceChannel, text);
		});
		
		ircbot.addListener('pm', function(sender, text) {
			executeCommand(sender, sender, text);
		});
	}
	
	function processConstructor() {
		if (constructors.length === 0) {
			console.log('Commands initialised');
			bindEvents();
			return;
		}

		(constructors.shift())(ircbot, config, utils, processConstructor);
	}
	
	let constructors = [];
	
	Object.keys(commands).forEach(function(key) {
		const command = commands[key];
		
		if (!('init' in command)) {
			return;
		}
		
		constructors.push(command.init);
	});
	
	console.log('Initialising commands...');
	
	processConstructor();
};
