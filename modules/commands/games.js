'use strict';

const Gamedig = require('gamedig');

module.exports = function(config, ircbot, utils) {
	function getGameName(result) {
		return result.raw.gamename || result.query.pretty;
	}
	
	function formatStatus(result) {
		return getGameName(result) + ' (' + result.name + ') at ' + result.map +
			' with ' + result.players.length + '/' + result.maxplayers + ' players' +
			(result.bots.length > 0 ? (' (' + result.bots.length + ' bots)') : '');
	}
	
	function formatPlayer(player, isBot) {
		const frags = 'score' in player ? player.score : ('frags' in player ? player.frags : 0);
		return '* ' + player.name + ' (' + Math.max(frags, 0) + ' frags)' + (isBot ? ' (BOT)' : '');
	}
	
	function execute(replyTo, sender, text) {
		config.servers.forEach(function(server) {
			Gamedig.query(server).then(function(result) {
				const prefix = result.query.host + ':' + result.query.port + ' | ';
				ircbot.say(replyTo, prefix + formatStatus(result));
				
				result.players.forEach(function(player) {
					ircbot.say(replyTo, prefix + formatPlayer(player, false));
				});
				result.bots.forEach(function(player) {
					ircbot.say(replyTo, prefix + formatPlayer(player, true));
				});
			}).catch(function(error) {
				const prefix = server.type + '@' + server.host + (server.port ? (':' + server.port) : '') + ' | ';
				ircbot.say(replyTo, prefix + 'Error getting server status: ' + error);
			});
		});
	}
	
	return {
		key: 'games',
		description: 'shows game servers info',
		execute: execute
	};
};
