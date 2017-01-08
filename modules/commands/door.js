'use strict';

module.exports = {
	key: 'door',
	description: 'shows door status',
	execute: function(ircbot, config, utils, from, to) {
		utils.getJson('https://fauna.initlab.org/api/door/status.json', function(data) {
			ircbot.say(to, 'The door is ' + data.latch + ' and ' + data.door);
		}, function(error) {
			ircbot.say(to, error);
		});
	}
};
