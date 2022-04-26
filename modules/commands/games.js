'use strict';

const Gamedig = require('gamedig');

module.exports = function(config, ircbot, utils) {
	function getGameName(result) {
		const query = result.query;
		const raw = result.raw;

		return (query.type === 'nexuiz' && raw.gamename) || query.pretty;
	}

	function getServerVersion(result) {
		const raw = result.raw;

		let version = raw.version?.name;

		if (!version && raw.gameversion) {
			const versionNum = parseInt(raw.gameversion, 10);
			const major = Math.floor(versionNum / 10000);
			const minor = Math.floor((versionNum % 10000) / 100);
			const patch = versionNum % 100;

			version = major.toString(10) + '.' + minor.toString(10) + '.' + patch.toString(10);
		}

		return version ? (' (' + version + ')') : '';
	}

	function getMap(result) {
		return result.map ? (' at ' + result.map) : '';
	}

	function formatStatus(result) {
		return getGameName(result) + getServerVersion(result) + getMap(result) +
			' with ' + result.players.length + '/' + result.maxplayers + ' players' +
			(result.bots.length > 0 ? (' (' + result.bots.length + ' bots)') : '');
	}

	function formatPlayer(player, isBot) {
		const frags = 'score' in player ? player.score : (
			'frags' in player ? player.frags : null
		);
		return '* ' + player.name +
			(frags !== null ? (' (' + frags + ' frags)') : '') +
			(isBot ? ' (BOT)' : '');
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
		keys: ['games'],
		description: 'shows game servers info',
		execute: execute
	};
};
