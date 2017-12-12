'use strict';

function shorten(request, longUrl, callback) {
	request.post('https://git.io/', {
		url: longUrl
	}, function(data, headers) {
		if ('location' in headers) {
			return callback(headers.location);
		}
		
		callback(null, 'Location header not found');
	}, function(error) {
		callback(null, error);
	});
}

function expand(shortUrl, callback) {
	// TODO
}

module.exports = {
	shorten: shorten,
	expand: expand
};
