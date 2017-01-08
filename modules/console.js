'use strict';

module.exports = function(ircbot) {
	// Whois
	ircbot.addListener('whois', function(info) {
		console.info(info.nick, 'is', info.user + '@' + info.host, '*', info.realname);
		
		if ('channels' in info) {
			console.info(info.nick, 'on', info.channels.join(' '));
		}
		
		console.info(info.nick, 'using', info.server, info.serverinfo);
		
		if ('away' in info) {
			console.info(info.nick, 'is away:', info.away);
		}

		if ('secure_connection' in info) {
			console.info(info.nick, 'is using a secure connection');
		}

		if ('actual_host' in info) {
			console.info(info.nick, 'actually using host', info.actual_host);
		}

		if ('idle' in info || 'signon' in info) {
			console.info(info.nick,
				(info.idle ? ('has been idle' + info.idle + 'sec') : '') +
				(info.idle && info.signon ? ', ' : '') +
				(info.signon ? ('signed on ' + info.signon) : '')
			);
		}
		
		if ('account' in info && 'accountinfo' in info) {
			console.info(info.nick, info.accountinfo, info.account);
		}

		console.info(info.nick, 'End of /WHOIS list.');
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
