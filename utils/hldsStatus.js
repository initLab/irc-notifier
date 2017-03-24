'use strict';

function formatServerType(type) {
	switch (type) {
		case 'd':
			return 'dedicated';
		case 'l':
			return 'non-dedicated';
		case 'p':
			return 'SourceTV relay (proxy)';
	}
	
	return 'unknown';
}

function formatEnvironment(type) {
	switch (type) {
		case 'l':
			return 'Linux';
		case 'w':
			return 'Windows';
		case 'm':
		case 'o':
			return 'Mac OS';
	}
	
	return 'unknown';
}

function checkError(data) {
	if ('error' in data) {
		throw new Error(data.error);
	}
}

function formatInfo(data) {
	checkError(data);
	
	const result = data.result;

	return result.Game + ' ' + formatServerType(result.ServerType) + ' server ' +
		'(' + result.Name + ') at map ' +
		result.Map + ' with ' + result.Players + ' of ' + result.MaxPlayers + ' players (' + result.Bots + ' bots)';
}

function formatPlayers(data) {
	checkError(data);
	
	return data.result.sort(function(a, b) {
		return a.Score < b.Score;
	}).map(function(player) {
		return [
			player.Name + ': ' + player.Score + ' frags',
			player.Duration
		];
	});
}

function sendGameStatus(config, ircbot, utils, replyTo) {
	utils.request.getJson('https://dev.6bez10.info/hlds/?host=' +
		encodeURIComponent(config.host) +
		'&port=' +
		encodeURIComponent(config.port) +
		'&action=info', function(data) {

		ircbot.say(replyTo, config.host + ':' + config.port + ' | ' + formatInfo(data));

		if (data.result.Players > 0) {
			utils.request.getJson('https://dev.6bez10.info/hlds/?host=' +
				encodeURIComponent(config.host) +
				'&port=' +
				encodeURIComponent(config.port) +
				'&action=players', function(data) {
				
				const players = formatPlayers(data);
				
				players.forEach(function(playerInfo) {
					ircbot.say(replyTo, config.host + ':' + config.port + ' | ' + playerInfo[0] +
						' (' + utils.time.formatTimePeriod(Math.round(playerInfo[1])) + ')');
				});
			}, function(error) {
				ircbot.say(replyTo, error);
			});
		}
	}, function(error) {
		ircbot.say(replyTo, error);
	});
}

module.exports = {
	sendGameStatus: sendGameStatus
};
