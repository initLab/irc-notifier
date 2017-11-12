'use strict';

function formatInfo(state) {
	return 'Minecraft ' + state.raw.version + ' server ' +
		'(' + state.raw.description + ') with ' + state.players.length + ' of ' + state.maxplayers + ' players';
}

function formatPlayers(players) {
	return 'Players online: ' + players.map(function(player) {
		return player.name;
	}).join(', ');
}

function sendGameStatus(config, ircbot, utils, replyTo) {
	const Gamedig = require('gamedig');
	const prefix = config.host + ':' + config.port + ' | ';

	Gamedig.query({
		type: 'minecraftping',
		host: config.host,
		port: config.port
	}).then(state => {
		ircbot.say(replyTo, prefix + formatInfo(state));
		
		if (state.players.length > 0) {
			ircbot.say(replyTo, prefix + formatPlayers(state.players));
		}
	}).catch(error => {
		ircbot.say(replyTo, prefix + 'Error getting server status (' + error + ')');
	});
}

module.exports = {
	sendGameStatus: sendGameStatus
};
