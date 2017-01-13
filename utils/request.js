'use strict';

function makeRequest(options, onSuccess, onError, parseOptions) {
	const request = require('request');
	
	return request(options, function(error, response, body) {
		try {
			if (error !== null) {
				throw error;
			}
			
			if (response && response.statusCode !== 200) {
				throw new Error('Error getting data, status code=' + response.statusCode);
			}
			
			if (parseOptions && 'xml' in parseOptions) {
				const xml2js = require('xml2js');
				
				return xml2js.parseString(body, function(err, result) {
					if (err !== null) {
						throw err;
					}
					
					onSuccess.call(response, result);
				});
			}
		
			onSuccess.call(response, body);
		}
		catch (e) {
			onError.call(response, e.message);
		}
	});
}

function get(url, onSuccess, onError) {
	return makeRequest({
		url: url
	}, onSuccess, onError);
}

function getJson(url, onSuccess, onError) {
	return makeRequest({
		url: url,
		json: true
	}, onSuccess, onError);
}

function getXml(url, onSuccess, onError) {
	return makeRequest({
		url: url,
	}, onSuccess, onError, {
		xml: true
	});
}

module.exports = {
	get: get,
	getJson: getJson,
	getXml: getXml
};
