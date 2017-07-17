'use strict';

module.exports = function(config, ircbot) {
	ircbot.addListener('raw', function(message) {
		switch (message.command) {
			case 'rpl_whoisidle':
				ircbot._addWhoisData(message.args[1], 'signon', new Date(parseInt(message.args[3]) * 1000));
				break;
			case '338':
				ircbot._addWhoisData(message.args[1], 'actual_host', message.args[2]);
				break;
			case '671':
				ircbot._addWhoisData(message.args[1], 'secure_connection', true);
				break;
		}
	});
	
	ircbot.constructor.prototype.remoteWhois = function(nick, callback) {
		if (typeof callback === 'function') {
			var callbackWrapper = function(info) {
				let whoisNick = '';

				try {
					whoisNick = info.nick.toLowerCase();
				}
				catch (e) {}

				if (whoisNick == nick.toLowerCase()) {
					this.removeListener('whois', callbackWrapper);
					return callback.apply(this, arguments);
				}
			};
			this.addListener('whois', callbackWrapper);
		}
		this.send('WHOIS', nick, nick);
	};
};
