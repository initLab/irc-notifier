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

function formatInfo(state) {
	return state.raw.game + ' ' + formatServerType(state.raw.listentype) + ' server ' +
		'(' + state.name + ') at map ' +
		state.map + ' with ' + state.players.length + ' of ' + state.maxplayers + ' players (' + state.bots.length + ' bots)';
}

function formatPlayer(player, utils) {
	return player.name + ': ' + player.score + ' frags (' + utils.time.formatTimePeriod(Math.round(player.time)) + ')';
}

function sendGameStatus(config, ircbot, utils, replyTo) {
	const Gamedig = require('gamedig');
	const prefix = config.host + ':' + config.port + ' | ';

	Gamedig.query({
		type: 'hldm',
		host: config.host,
		port: config.port
	}).then(state => {
		ircbot.say(replyTo, prefix + formatInfo(state));
		
		if (state.players.length > 0) {
			state.players.sort(function(a, b) {
				return a.score < b.score;
			}).forEach(function(player) {
				ircbot.say(replyTo, prefix + formatPlayer(player, utils));
			});
		}
	}).catch(error => {
		ircbot.say(replyTo, prefix + 'Error getting server status (' + error + ')');
	});
}

module.exports = {
	sendGameStatus: sendGameStatus
};
