'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo) {
		utils.rss.getEvents(config, utils, function(events) {
			if (events instanceof Error) {
				return ircbot.say(replyTo, events.message);
			}
			
			// select events
			for (let i = 0; i < events.length; ++i) {
				const event = events[i];
				const title = event.title.toString().toLowerCase();
				
				for (let j = 0; j < config.keywords.length; j++) {
					if (title.indexOf(config.keywords[j].toLowerCase()) > -1) {
						return utils.rss.sendToIrc([
							event
						], replyTo, ircbot, utils);
					}
				}
			}
		});
	}
	
	return {
		key: 'us',
		description: 'shows next board meeting of init Lab',
		execute: execute
	};
};
