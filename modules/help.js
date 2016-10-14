module.exports = function(ircbot, config) {
	ircbot.addListener('message', function (from, to, message) {
		if (to !== config.irc.announceChannel || message !== '!help') {
			return;
		}
		
		ircbot.say(to, 'Available commands: !door - shows door status, !who - shows present users, !lights - shows lights status, !weather - shows the weather station readings');
	});
};
