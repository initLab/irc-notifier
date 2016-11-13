'use strict';

module.exports = function(ircbot) {
	ircbot.addListener('channellist_start', function() {
		console.info('Listing channels...');
	});

	ircbot.addListener('channellist_item', function(info) {
		console.info(info.name, info.users, info.topic);
	});
};
