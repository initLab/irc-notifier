'use strict';

function makeRequest(options, onSuccess, onError, parseOptions) {
	const request = require('request');
	
	return request(options, function(error, response, body) {
		try {
			if (error !== null) {
				throw error;
			}
			
			if (response && response.statusCode >= 500) {
				throw new Error('Server error, status code=' + response.statusCode);
			}
			
			if (response && response.statusCode >= 400 && !body) {
				throw new Error('Error getting data, status code=' + response.statusCode);
			}
			
			if (parseOptions && 'xml' in parseOptions) {
				const xml2js = require('xml2js');
				
				return xml2js.parseString(body, function(err, result) {
					if (err !== null) {
						throw err;
					}
					
					if (onSuccess) {
						onSuccess.call(response, result, response.headers);
					}
				});
			}
			
			if (onSuccess) {
				onSuccess.call(response, body, response.headers);
			}
		}
		catch (e) {
			console.error(e.stack);
			
			if (onError) {
				onError.call(response, e);
			}
		}
	});
}

function get(url, onSuccess, onError) {
	return makeRequest({
		url: url
	}, onSuccess, onError);
}

function getWithOptions(url, options, onSuccess, onError) {
	options.url = url;
	
	return makeRequest(options, onSuccess, onError);
}

function getJson(url, onSuccess, onError) {
	return makeRequest({
		url: url,
		json: true
	}, onSuccess, onError);
}

function getJsonOAuth2(url, token, onSuccess, onError) {
	return makeRequest({
		url: url,
		json: true,
		auth: {
			bearer: token
		}
	}, onSuccess, onError);
}

function getXml(url, onSuccess, onError) {
	return makeRequest({
		url: url,
	}, onSuccess, onError, {
		xml: true
	});
}

function post(url, data, onSuccess, onError) {
	return makeRequest({
		method: 'POST',
		url: url,
		form: data
	}, onSuccess, onError);
}

function postOAuth2(url, data, token, onSuccess, onError) {
	return makeRequest({
		method: 'POST',
		url: url,
		auth: {
			bearer: token
		},
		form: data
	}, onSuccess, onError);
}

module.exports = {
	get: get,
	getWithOptions: getWithOptions,
	getJson: getJson,
	getJsonOAuth2: getJsonOAuth2,
	getXml: getXml,
	post: post,
	postOAuth2: postOAuth2
};
