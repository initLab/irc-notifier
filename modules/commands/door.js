'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo) {
		utils.request.getJson('https://fauna.initlab.org/api/door/status.json', function(data) {
			ircbot.say(replyTo, 'The door is ' + data.latch + ' and ' + data.door);
		}, function(error) {
			ircbot.say(replyTo, error);
		});
	}

	return {
		key: 'door',
		description: 'shows door status',
		execute: execute
	};
};
