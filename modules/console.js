'use strict';

module.exports = function(ircbot, config, utils) {
	const logger = utils.logger.log;
	
	// Whois
	ircbot.addListener('whois', function(info) {
		logger(info.nick, 'is', info.user + '@' + info.host, '*', info.realname);
		
		if ('channels' in info) {
			logger(info.nick, 'on', info.channels.join(' '));
		}
		
		logger(info.nick, 'using', info.server, info.serverinfo);
		
		if ('away' in info) {
			logger(info.nick, 'is away:', info.away);
		}

		if ('secure_connection' in info) {
			logger(info.nick, 'is using a secure connection');
		}

		if ('actual_host' in info) {
			logger(info.nick, 'actually using host', info.actual_host);
		}

		if ('idle' in info || 'signon' in info) {
			logger(info.nick,
				(info.idle ? ('has been idle ' + info.idle + 'sec') : '') +
				(info.idle && info.signon ? ', ' : '') +
				(info.signon ? ('signed on ' + info.signon) : '')
			);
		}
		
		if ('account' in info && 'accountinfo' in info) {
			logger(info.nick, info.accountinfo, info.account);
		}

		logger(info.nick, 'End of /WHOIS list.');
	});

	// Channel list
	ircbot.addListener('channellist_start', function() {
		logger('Listing channels...');
	});

	ircbot.addListener('channellist_item', function(info) {
		logger(info.name, info.users, info.topic);
	});

	// Misc raw
	ircbot.addListener('raw', function(message) {
		switch (message.rawCommand) {
			case '704':
			case '705':
			case '706':
				logger(message.args[2]);
			break;
		}
	});

	// Error handler
	ircbot.addListener('error', function(message) {
		logger('IRCBOT', message);
	});
};
