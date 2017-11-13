'use strict';

function formatInfo(state) {
	return state.raw.gamename + ' server ' + '(' + state.name + ') at map ' +
		state.map + ' with ' + state.players.length + ' of ' + state.maxplayers + ' players (' + state.bots.length + ' bots)';
}

function formatPlayer(player) {
	return player.name + ': ' + player.frags + ' frags (ping: ' + player.ping + 'ms)';
}

function sendGameStatus(config, ircbot, utils, replyTo) {
	const Gamedig = require('gamedig');
	const prefix = config.host + ':' + config.port + ' | ';

	Gamedig.query({
		type: 'quake3',
		host: config.host,
		port: config.port
	}).then(state => {
		ircbot.say(replyTo, prefix + formatInfo(state));
		
		if (state.players.length > 0) {
			state.players.sort(function(a, b) {
				return a.frags < b.frags;
			}).forEach(function(player) {
				ircbot.say(replyTo, prefix + formatPlayer(player));
			});
		}
	}).catch(error => {
		ircbot.say(replyTo, prefix + 'Error getting server status (' + error + ')');
	});
}

module.exports = {
	sendGameStatus: sendGameStatus
};
