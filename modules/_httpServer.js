'use strict';

module.exports = function(config, ircbot, utils) {
	let dispatcher = null;
	let callbacks = [];
	
	ircbot.addListener('registerHttp', function() {
		const callback = [].slice.call(arguments);
		
		callbacks.push(callback);
		
		if (dispatcher !== null) {
			dispatcher.on.apply(dispatcher, callback);
		}
	});

	const server = new utils.httpServer.Server(config, function(error) {
		if (error) {
			console.log(error);
		}
	}, function(disp) {
		dispatcher = disp;

		callbacks.forEach(function(callback) {
			dispatcher.on.apply(dispatcher, callback);
		});
	});
};
