'use strict';

function shortenEventUrl(event, callback, utils) {
	const url = event.link[0];
	
	utils.url.shorten(utils.request, url, function(shortUrl) {
		if (shortUrl === url) {
			return callback(new Error('URL shortening failed'), event);
		}
		
		event.shortUrl = shortUrl;
		callback(null, event);
	});
}

function getEvents(config, utils, callback) {
	utils.request.getXml(config.rssUrl, function(data) {
		if (!('item' in data.rss.channel[0])) {
			callback(new Error('No events found :('));
			return;
		}
		
		// get all events
		const events = data.rss.channel[0].item;
		
		if (events.length === 0) {
			callback(new Error('No events found :('));
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
		events.sort(function(a, b) {
			const key = 'timestamp';
			const x = a[key], y = b[key];
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		});
		
		callback(events);
	}, function (error) {
		callback(new Error(error));
	});
}

function sendToIrc(events, replyTo, ircbot, utils) {
	if (events.length === 0) {
		return ircbot.say(replyTo, 'No events found :(');
	}
	
	const async = require('async');
	
	async.map(events, (event, callback) => shortenEventUrl(event, callback, utils), function(err, results) {
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
}

module.exports = {
	getEvents,
	sendToIrc
};
