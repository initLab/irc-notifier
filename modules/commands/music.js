module.exports = {
	key: 'music',
	description: 'shows current music track',
	execute: function(ircbot, config, from, to) {
		var request = require('request');
		
		request({
			url: 'http://spitfire.initlab.org:8989/status',
			json: true
		}, function(error, response, body) {
			if (error !== null) {
				ircbot.say(to, error.reason ? ('Request error: ' + error.reason) : error.toString());
				return;
			}
			
			if (response && response.statusCode !== 200) {
				ircbot.say(to, 'Error getting data, status code=' + response.statusCode);
				return;
			}
			
			if (body.error) {
				ircbot.say('Error reading music status: ' + body.error);
				return;
			}
			
			var states = {
				play: 'playing',
				pause: 'paused',
				stop: 'stopped',
			};

			ircbot.say(to, 
				'[' + states[body.status.state] + '] ' + (
					body.currentSong.Artist ? (body.currentSong.Artist + ' - ') : ''
				) + body.currentSong.Title + (
					body.currentSong.Album ? (' (' + body.currentSong.Album + (
						body.currentSong.Date ? (', ' + body.currentSong.Date) : ''
					) + ')') : ''
				)
			);
		});
	}
};
