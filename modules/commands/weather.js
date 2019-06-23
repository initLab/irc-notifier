'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo, sender, text) {
		if (text.trim().length === 0) {
			text = 'Sofia';
		}
		
		utils.request.get('https://wttr.in/' + encodeURIComponent(text) + '?format=' + encodeURIComponent('%l: %c %t %w %m'), function(data) {
			ircbot.say(replyTo, data);
		}, function(error) {
			ircbot.say(replyTo, error);
		});
	}
	
	return {
		key: 'weather',
		description: 'shows current weather',
		execute: execute
	};
};
