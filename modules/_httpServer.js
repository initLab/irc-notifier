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

	new utils.httpServer.Server(config, function(error) {
		if (error) {
			console.log(error);
		}
	}, function(currentDispatcher) {
		dispatcher = currentDispatcher;

		callbacks.forEach(function(callback) {
			dispatcher.on.apply(dispatcher, callback);
		});
	});
};
