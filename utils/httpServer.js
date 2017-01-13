'use strict';

function Server(config, callback, setupDispatcher) {
	let listenPort = null;
	let listenHost = '0.0.0.0';
	
	try {
		listenPort = config.listen.port;
	}
	catch (e) {
		callback(new Error('No HTTP config'));
		return;
	}
	
	try {
		listenHost = config.listen.host;
	}
	catch (e) {
	}
	
	const http = require('http');
	const HttpDispatcher = require('httpdispatcher');
	const dispatcher = new HttpDispatcher;
	
	if (setupDispatcher) {
		setupDispatcher(dispatcher);
	}
	
	console.log('Starting HTTP server...');

	const server = http.createServer(function(req, res) {
		const conn = req.connection;
		
		console.log('HTTP client connected: ' + conn.remoteAddress + ':' + conn.remotePort);
		console.log(req.method + ' ' + req.url);
		
		try {
			dispatcher.dispatch(req, res);
		}
		catch(err) {
			console.log(err);
		}
	}).listen(listenPort, listenHost, function() {
		console.log('Server listening on: http://' + listenHost + ':' + listenPort);
		
		if (callback) {
			callback();
		}
	})
	
	if (callback) {
		server.addListener('error', callback);
	}
	
	return {
		close: server.close.bind(server)
	};
}

exports.Server = Server;
