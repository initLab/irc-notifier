'use strict';

function shortenEventUrl(event, callback, utils) {
	const url = event.link[0];
	
	utils.request.get('https://is.gd/create.php?format=simple&url=' + encodeURIComponent(url), function(data) {
		event.shortUrl = data;
		callback(null, event);
	}, function(error) {
		callback(error, event);
	});
}

module.exports = function(config, ircbot, utils) {
	function execute(replyTo) {
		utils.request.getXml('https://initlab.org/events/feed/', function(data) {
			const async = require('async');
			
			if (!('item' in data.rss.channel[0])) {
				ircbot.say(replyTo, 'No events found :(');
				return;
			}
			
			// get all events
			const events = data.rss.channel[0].item;
			
			if (events.length === 0) {
				ircbot.say(replyTo, 'No events found :(');
				return;
			}
			
			// parse the start time
			for (let i = 0; i < events.length; ++i) {
				const ts = Date.parse(events[i].pubDate[0]);
				const dt = new Date(ts);
				events[i].timestamp = ts;
				events[i].datetime = dt;
				events[i].date = dt.getFullYear() + '-' + dt.getMonth() + '-' + dt.getDate();
			}

			// sort by start time ascending
			const sortedEvents = events.sort(function(a, b) {
				const key = 'timestamp';
				const x = a[key], y = b[key];
				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			});

			// select events
			let selectedEvents = [];
			const todayHasEvents = utils.time.isToday(sortedEvents[0]);
			
			let lastDate = null;
			for (let i = 0; i < sortedEvents.length; ++i) {
				const event = sortedEvents[i];
				
				if (todayHasEvents) {
					// show today's events
					// also show next day's events
					
					if (lastDate !== null && event.date !== lastDate) {
						break;
					}
					
					if (event.date !== sortedEvents[0].date) {
						lastDate = event.date;
					}
				}
				else {
					// show events that happen on the first date with events
					
					if (event.date !== sortedEvents[0].date) {
						break;
					}
				}
				
				selectedEvents.push(event);
			}

			// send to IRC
			async.map(selectedEvents, (event, callback) => shortenEventUrl(event, callback, utils), function(err, results) {
				try {
					if (err !== null) {
						throw err;
					}
					
					for (let i = 0; i < results.length; ++i) {
						const event = results[i];
						
						ircbot.say(replyTo, '[' + utils.time.formatDateTimeShort(event.datetime) + '] ' +
							event.title + ' ' + event.shortUrl);
					}
				}
				catch (e) {
					console.error(e.stack);
					ircbot.say(replyTo, e);
					return false;
				}
			});
		}, function (error) {
			ircbot.say(replyTo, error);
		});
	}
	
	return {
		key: 'events',
		description: 'shows events at init Lab',
		execute: execute
	};
};
