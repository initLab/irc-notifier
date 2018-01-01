'use strict';

const { URL } = require('url');

function shortenGitIo(request, longUrl, callback) {
	request.post('https://git.io/', {
		url: longUrl
	}, function(data, headers) {
		if ('location' in headers) {
			return callback(headers.location);
		}
		
		console.log('[Git.io] Location data not found', data, headers);
		callback(longUrl);
	}, function(error) {
		console.log(error);
		callback(longUrl);
	});
}

function shortenIsGd(request, longUrl, callback) {
	request.get('https://is.gd/create.php?format=simple&url=' + encodeURIComponent(longUrl), function(data) {
		callback(data);
	}, function(error) {
		console.log(error);
		callback(longUrl);
	});
}

function shorten(request, longUrl, callback) {
	const parsed = new URL(longUrl);
	
	if (['github.com'].indexOf(parsed.hostname) !== -1) {
		return shortenGitIo(request, longUrl, callback);
	}
	
	return shortenIsGd(request, longUrl, callback);
}

function expand(shortUrl, callback) {
	// TODO
}

module.exports = {
	shorten: shorten,
	expand: expand
};
