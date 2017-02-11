'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo) {
		utils.request.getJson('https://fauna.initlab.org/api/lights/status.json', function(data) {
			ircbot.say(replyTo, 'Lights are ' + data.status + ', policy is ' + data.policy);
		}, function(error) {
			ircbot.say(replyTo, error);
		});
	}
	
	return {
		key: 'lights',
		description: 'shows lights status',
		execute: execute
	};
};
