'use strict';

module.exports = {
	key: 'lights',
	description: 'shows lights status',
	execute: function(ircbot, config, utils, from, to) {
		utils.getJson('https://fauna.initlab.org/api/lights/status.json', function(data) {
			ircbot.say(to, 'Lights are ' + data.status + ', policy is ' + data.policy);
		}, function(error) {
			ircbot.say(to, error);
		});
	}
};
