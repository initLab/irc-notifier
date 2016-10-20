module.exports = function(ircbot, config) {
	var requireDir = require('require-dir');
	var commands = requireDir('commands');
	
	ircbot.addListener('message', function (from, to, message) {
		if (to !== config.irc.announceChannel) {
			return;
		}
		
		Object.keys(commands).forEach(function(key) {
			var command = commands[key];
			var commandPrefix = '!' + command.key.toLowerCase();
			var lowercaseMessage = message.toLowerCase();
			
			if (lowercaseMessage !== commandPrefix && lowercaseMessage.indexOf(commandPrefix + ' ') !== 0) {
				return;
			}
			
			command.execute(ircbot, config, from, to, message.substr(commandPrefix.length + 1), commands);
		});
	});
};
