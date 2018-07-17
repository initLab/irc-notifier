'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo, sender, text) {
		utils.request.getWithOptions('https://wttr.in/' + encodeURIComponent(text) + '?mM0q&lang=bg', {
			headers: {
				'User-Agent': 'request (Compatible; curl)'
			}
		}, function(data) {
			ircbot.say(replyTo, data.replace(/\x1b\[([0-9;]*)([mGKH])/g, function(match, codes, command, offset, string) {
				return '';
			}));
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
