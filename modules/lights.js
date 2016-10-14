module.exports = function(ircbot, config) {
	var request = require('request');
	
	ircbot.addListener('message', function (from, to, message) {
		if (to !== config.irc.announceChannel || message !== '!lights') {
			return;
		}
		
		request({
			url: 'https://fauna.initlab.org/api/lights/status.json',
			json: true
		}, function(error, response, body) {
			if (error !== null || response.statusCode !== 200) {
				ircbot.say(to, 'Error getting data, status code=' + response.statusCode);
				return;
			}
			
			ircbot.say(to, 'Lights are ' + body.status + ', policy is ' + body.policy);
		});
	});
};
