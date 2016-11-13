'use strict';

const request = require('request');

function shortenEventUrl(event, callback) {
	let url = event.link[0];

	request({
		url: 'https://is.gd/create.php?format=simple&url=' + encodeURIComponent(url)
	}, function(error, response, body) {
		if (response && response.statusCode !== 200) {
			event.shortUrl = url;
			return callback('HTTP error ' + response.statusCode, event);
		}

		event.shortUrl = body;
		callback(error, event);
	});
}

function isToday(datetime) {
	let dt = new Date;

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
	description: 'shows events in init Lab',
	execute: function(ircbot, config, from, to) {
		request({
			url: 'https://initlab.org/events/feed/'
		}, function(error, response, body) {
			if (error !== null) {
				ircbot.say(to, 'Request error: ' + error.reason);
				return;
			}

			if (response && response.statusCode !== 200) {
				ircbot.say(to, 'Error getting data, status code=' + response.statusCode);
				return;
			}

			const xml2js = require('xml2js');

			xml2js.parseString(body, function(err, result) {
				const async = require('async');

				if (err !== null) {
					ircbot.say(to, 'Error parsing data: ' + err);
					return;
				}

				// get all events
				let events = result.rss.channel[0].item;
				let sortedEvents = [];

				// parse the start time
				for (let i = 0; i < events.length; ++i) {
					let ts = Date.parse(events[i].pubDate[0]);
					events[i].timestamp = ts;
					events[i].datetime = new Date(ts);
				}

				// sort by start time ascending
				sortedEvents = events.sort(function(a, b) {
					let key = 'timestamp';
					let x = a[key], y = b[key];
					return ((x < y) ? -1 : ((x > y) ? 1 : 0));
				});

				// send events to IRC
				async.map(sortedEvents, shortenEventUrl, function(err, results) {
					for (let i = 0; i < results.length; ++i) {
						let event = results[i];
						let today = isToday(event.datetime);
						
						// if there are events today, show all of them
						// if not, show the next one
						if (!today && i > 0) {
							break;
						}

						ircbot.say(to, '[' + formatDate(event.datetime) + '] ' +
							event.title + ' ' + event.shortUrl);
					}
				});
			});
		});
	}
};
