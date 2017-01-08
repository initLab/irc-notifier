'use strict';

module.exports = {
	key: 'music',
	description: 'shows current music track',
	execute: function(ircbot, config, utils, from, to) {
		utils.getJson('http://spitfire.initlab.org:8989/status', function(data) {
			if (data.error) {
				ircbot.say('Error reading music status: ' + data.error);
				return;
			}
			
			const states = {
				play: 'playing',
				pause: 'paused',
				stop: 'stopped',
			};

			ircbot.say(to, 
				'[' + states[data.status.state] + ']' + (data.currentSong ? (' ' + (
					data.currentSong.Artist ? (data.currentSong.Artist + ' - ') : ''
				) + (
					data.currentSong.Title || ''
				) + (
					data.currentSong.Album ? (' (' + data.currentSong.Album + (
						data.currentSong.Date ? (', ' + data.currentSong.Date) : ''
					) + ')') : ''
				)) : '')
			);
		}, function(error) {
			ircbot.say(to, error);
		});
	}
};
