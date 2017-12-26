'use strict';

function shorten(request, longUrl, callback) {
	request.post('https://git.io/', {
		url: longUrl
	}, function(data, headers) {
		if ('location' in headers) {
			return callback(headers.location);
		}
		
		console.log('Location data not found', data, headers);
		callback(longUrl);
	}, function(error) {
		console.log(error);
		callback(longUrl);
	});
}

function expand(shortUrl, callback) {
	// TODO
}

module.exports = {
	shorten: shorten,
	expand: expand
};
