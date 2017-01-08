'use strict';

function shortenEventUrl(event, callback, utils) {
	const url = event.link[0];

	utils.get('https://is.gd/create.php?format=simple&url=' + encodeURIComponent(url), function(data) {
		event.shortUrl = data;
		callback(null, event);
	}, function(error) {
		callback(error, event);
	});
}

function isToday(datetime) {
	const dt = new Date;

	return
		dt.getDate() === datetime.getDate() &&
		dt.getMonth() === datetime.getMonth() &&
		dt.getYear() === datetime.getYear();
}

function leadingZero(num) {
	if (num > 9) {
		return num;
	}
	
	return '0' + num;
}

function formatDate(datetime) {
	return leadingZero(datetime.getDate()) + '.' +
		leadingZero(datetime.getMonth() + 1) + '.' +
		datetime.getFullYear() + ' ' +
		leadingZero(datetime.getHours()) + ':' +
		leadingZero(datetime.getMinutes());
}

module.exports = {
	key: 'events',
	description: 'shows events at init Lab',
	execute: function(ircbot, config, utils, from, to) {
		utils.getXml('https://initlab.org/events/feed/', function(data) {
			const async = require('async');
			
			// get all events
			const events = data.rss.channel[0].item;

			// parse the start time
			for (let i = 0; i < events.length; ++i) {
				const ts = Date.parse(events[i].pubDate[0]);
				events[i].timestamp = ts;
				events[i].datetime = new Date(ts);
			}

			// sort by start time ascending
			const sortedEvents = events.sort(function(a, b) {
				const key = 'timestamp';
				const x = a[key], y = b[key];
				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			});

			// select events
			let selectedEvents = [];
			
			for (let i = 0; i < sortedEvents.length; ++i) {
				const event = sortedEvents[i];
				const today = isToday(event.datetime);
				
				// if there are events today, show all of them
				// if not, show the next one
				if (!today && i > 0) {
					break;
				}
				
				selectedEvents.push(event);
			}
			
			// send to IRC
			async.map(selectedEvents, (event, callback) => shortenEventUrl(event, callback, utils), function(err, results) {
				if (err !== null) {
					ircbot.say(to, err);
					return false;
				}
				
				for (let i = 0; i < results.length; ++i) {
					const event = results[i];
					
					ircbot.say(to, '[' + formatDate(event.datetime) + '] ' +
						event.title + ' ' + (event.shortUrl));
				}
			});
		}, function (error) {
			ircbot.say(to, error);
		});
	}
};
