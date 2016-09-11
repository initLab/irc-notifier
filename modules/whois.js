module.exports = function(ircbot) {
	ircbot.addListener('whois', function(info) {
		console.info(info.nick, 'is', info.user + '@' + info.host, '*', info.realname);
		console.info(info.nick, 'on', info.channels.join(' '));
		console.info(info.nick, 'using', info.server, info.serverinfo);
		console.info(info.nick, 'End of /WHOIS list.');
	});
};
