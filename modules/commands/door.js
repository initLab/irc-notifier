'use strict';

module.exports = {
	key: 'door',
	description: 'shows door status',
	execute: function(ircbot, config, utils, replyTo) {
		utils.getJson('https://fauna.initlab.org/api/door/status.json', function(data) {
			ircbot.say(replyTo, 'The door is ' + data.latch + ' and ' + data.door);
		}, function(error) {
			ircbot.say(replyTo, error);
		});
	}
};
