'use strict';

module.exports = {
	key: 'who',
	description: 'shows present users',
	execute: function(ircbot, config, utils, from, to, message) {
		if (message.toLowerCase() === 'let the dogs out') {
			ircbot.say(to, 'Who? Who? Who? Who? https://youtu.be/Qkuu0Lwb5EM');
			return;
		}
		
		if (message.toLowerCase() === 'the fuck is alice') {
			ircbot.say(to, 'https://youtu.be/bUy83PKjkOI');
			return;
		}
		
		utils.getJson('https://fauna.initlab.org/api/users/present.json', function(data) {
			if (data.length === 0) {
				ircbot.say(to, 'No one in init Lab :(');
				return;
			}

			const mystery_users = data.filter(function(user) {
				return user.id === null;
			}).length;
			
			const people = data.filter(function(user) {
				return user.id !== null;
			}).map(function(user) {
				return user.name + ' (' + user.username + ')';
			});
			
			if (mystery_users > 0) {
				let mystery_str;
				
				if (mystery_users === 1) {
					mystery_str = 'Mystery labber';
				}
				else {
					mystery_str = mystery_users + ' Mystery labbers';
				}
				
				people.push(mystery_str);
			}
			
			ircbot.say(to, 'People in init Lab: ' + people.join(', '));
		}, function(error) {
			ircbot.say(to, error);
		});
	}
};
