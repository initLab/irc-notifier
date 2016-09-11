module.exports = function(ircbot, config) {
	ircbot.addListener('message', function (from, to, message) {
		if (to !== config.irc.announceChannel || message !== '!door') {
			return;
		}
		
		request({
			url: 'https://fauna.initlab.org/api/door/status.json',
			json: true
		}, function(error, response, body) {
			ircbot.say(to, 'The door is ' + body.latch + ' and ' + body.door);
		});
	});
};
