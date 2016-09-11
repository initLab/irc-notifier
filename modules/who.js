module.exports = function(ircbot, config) {
	var request = require('request');
	
	ircbot.addListener('message', function (from, to, message) {
		if (to !== config.irc.announceChannel || message !== '!who') {
			return;
		}
		
		request({
			url: 'https://fauna.initlab.org/api/users/present.json',
			json: true
		}, function(error, response, body) {
			if (error !== null || response.statusCode !== 200) {
				ircbot.say(to, 'Error getting data');
				return;
			}
			
			ircbot.say(to, 'People in init Lab: ' + body.map(function(user) {
				return user.name + ' (' + user.username + ')';
			}).join(', '));
		});
	});
};
