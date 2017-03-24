'use strict';

function checkError(data) {
	if ('error' in data) {
		throw new Error(data.error);
	}
}

function formatInfo(data) {
	checkError(data);
	
	const result = data.result;

	return 'Minecraft ' + result.version.name + ' server ' +
		'(' + result.description.text + ') with ' + result.players.online + ' of ' + result.players.max + ' players';
}

function formatPlayers(data) {
	checkError(data);
	
	return 'Players online: ' + data.result.players.sample.map(function(player) {
		return player.name;
	}).join(', ');
}

function sendGameStatus(config, ircbot, utils, replyTo) {
	utils.request.getJson('https://dev.6bez10.info/minecraft/?host=' +
		encodeURIComponent(config.host) +
		'&port=' +
		encodeURIComponent(config.port) +
		'&action=info', function(data) {

		ircbot.say(replyTo, config.host + ':' + config.port + ' | ' + formatInfo(data));
		
		if (data.result.players.online > 0) {
			ircbot.say(replyTo, config.host + ':' + config.port + ' | ' + formatPlayers(data));
		}
	}, function(error) {
		ircbot.say(replyTo, error);
	});
}

module.exports = {
	sendGameStatus: sendGameStatus
};
