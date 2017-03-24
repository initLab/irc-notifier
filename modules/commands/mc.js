'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo, sender, text) {
		utils.minecraftStatus.sendGameStatus(config, ircbot, utils, replyTo);
	}
	
	return {
		key: 'mc',
		description: 'shows MC server info',
		execute: execute
	};
};
