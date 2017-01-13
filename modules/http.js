'use strict';

module.exports = function(ircbot, config, utils) {
	let listenPort = null;
	let listenHost = '0.0.0.0';
	
	try {
		listenPort = config.http.listen.port;
	}
	catch (e) {
		return;
	}
	
	try {
		listenHost = config.http.listen.host;
	}
	catch (e) {
	}
	
	const http = require('http');
	const HttpDispatcher = require('httpdispatcher');
	const dispatcher = new HttpDispatcher;
	const logger = utils.logger.log;
	
	dispatcher.onGet('/', function(req, res) {
		res.writeHead(200, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({
			status: 'OK'
		}));
	});

	http.createServer(function(req, res) {
		const conn = req.connection;
		
		logger('HTTP client connected: ' + conn.remoteAddress + ':' + conn.remotePort);
		logger(req.method + ' ' + req.url);
		
		try {
			dispatcher.dispatch(req, res);
		}
		catch(err) {
			logger(err);
		}
	}).listen(listenPort, listenHost, function() {
		logger('Server listening on: http://' + listenHost + ':' + listenPort);
	});
};
