'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo) {
		utils.rss.getEvents(config, utils, function(events) {
			if (events instanceof Error) {
				return ircbot.say(replyTo, events.message);
			}

			// select events
			let selectedEvents = [];
			const todayHasEvents = utils.time.isToday(events[0]);

			let lastDate = null;
			for (let i = 0; i < events.length; ++i) {
				const event = events[i];

				if (todayHasEvents) {
					// show today's events
					// also show next day's events

					if (lastDate !== null && event.date !== lastDate) {
						break;
					}

					if (event.date !== events[0].date) {
						lastDate = event.date;
					}
				}
				else {
					// show events that happen on the first date with events

					if (event.date !== events[0].date) {
						break;
					}
				}

				selectedEvents.push(event);
			}

			utils.rss.sendToIrc(selectedEvents, replyTo, ircbot, utils);
		});
	}

	return {
		keys: ['events'],
		description: 'shows events at init Lab',
		execute: execute
	};
};
