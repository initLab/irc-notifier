'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo, sender, text) {
		if (text.toLowerCase() === 'let the dogs out') {
			ircbot.say(replyTo, 'Who? Who? Who? Who? https://youtu.be/Qkuu0Lwb5EM');
			return;
		}

		if (text.toLowerCase() === 'the fuck is alice') {
			ircbot.say(replyTo, 'https://youtu.be/bUy83PKjkOI');
			return;
		}

		utils.request.getJson('https://fauna.initlab.org/api/users/present.json', function(data) {
			if ('status' in data && 'error' in data) {
				ircbot.say(replyTo, 'Request error: ' + data.error + ' (code ' + data.status + ')');
				return;
			}

			if (data.length === 0) {
				ircbot.say(replyTo, 'No one in init Lab :(');
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

			ircbot.say(replyTo, 'People in init Lab: ' + people.join(', '));
		}, function(error) {
			ircbot.say(replyTo, error);
		});
	}

	return {
		keys: ['who', 'кой'],
		description: 'shows present users',
		execute: execute
	};
};
