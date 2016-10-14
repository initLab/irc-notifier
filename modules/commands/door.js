module.exports = {
	key: 'door',
	description: 'shows door status',
	execute: function(ircbot, config, from, to) {
		var request = require('request');
		
		request({
			url: 'https://fauna.initlab.org/api/door/status.json',
			json: true
		}, function(error, response, body) {
			if (error !== null) {
				ircbot.say(to, 'Request error: ' + error.reason);
				return;
			}
			
			if (response && response.statusCode !== 200) {
				ircbot.say(to, 'Error getting data, status code=' + response.statusCode);
				return;
			}
			
			ircbot.say(to, 'The door is ' + body.latch + ' and ' + body.door);
		});
	}
};
