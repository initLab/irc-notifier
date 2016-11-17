'use strict';

module.exports = function(ircbot) {
	// Whois
	let whoisData = {};

	ircbot.addListener('raw', function(message) {
		if (['338', '671'].indexOf(message.rawCommand) === -1) {
			return;
		}

		if (!(message.args[1] in whoisData)) {
			whoisData[message.args[1]] = [];
		}

		switch (message.rawCommand) {
			case '338':
				whoisData[message.args[1]].push(message.args[3] + ' ' + message.args[2]);
				break;
			case '671':
				whoisData[message.args[1]].push(message.args[2]);
				break;
		}
	});

	ircbot.addListener('whois', function(info) {
		console.info(info.nick, 'is', info.user + '@' + info.host, '*', info.realname);
		console.info(info.nick, 'on', info.channels.join(' '));
		console.info(info.nick, 'using', info.server, info.serverinfo);
		
		if ('away' in info) {
			console.info(info.nick, 'is away:', info.away);
		}

		if (info.nick in whoisData) {
			whoisData[info.nick].forEach(function(msg) {
				console.info(info.nick, msg);
			});
		}
		
		console.info(info.nick, 'has been idle', info.idle + 's');
		
		if ('account' in info && 'accountinfo' in info) {
			console.info(info.nick, info.accountinfo, info.account);
		}

		console.info(info.nick, 'End of /WHOIS list.');

		delete whoisData[info.nick];
	});

	// Channel list
	ircbot.addListener('channellist_start', function() {
		console.info('Listing channels...');
	});

	ircbot.addListener('channellist_item', function(info) {
		console.info(info.name, info.users, info.topic);
	});

	// Misc raw
	ircbot.addListener('raw', function(message) {
		switch (message.rawCommand) {
			case '704':
			case '705':
			case '706':
				console.log(message.args[2]);
			break;
		}
	});

	// Error handler
	ircbot.addListener('error', function(message) {
		console.error('IRCBOT', message);
	});
};
