'use strict';

const URL = require('url');
const QS = require('querystring');

function processRequest(cb) {
	return function(req, res) {
		const url = URL.parse(req.url);
		const query = QS.parse(url.query);
		cb(req, res, url, query);
	};
}

function attachDispatcher(dispatcher, callback) {
	dispatcher.on(callback.method, callback.url, processRequest(callback.cb));
}

module.exports = function(config, ircbot, utils) {
	let dispatcher = null;
	let callbacks = [];
	
	ircbot.addListener('registerHttp', function(method, url, cb) {
		const callback = {
			method: method,
			url: url,
			cb: cb
		};
		
		callbacks.push(callback);
		
		if (dispatcher !== null) {
			attachDispatcher(dispatcher, callback);
		}
	});

	const server = new utils.httpServer.Server(config, function(error) {
		if (error) {
			console.log(error);
		}
	}, function(disp) {
		dispatcher = disp;

		callbacks.forEach(function(callback) {
			attachDispatcher(dispatcher, callback);
		});
	});
};
