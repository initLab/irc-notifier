'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo, sender, text) {
		utils.gameStatus.sendGameStatus(config, ircbot, utils, replyTo);
	}
	
	return {
		key: 'cs',
		description: 'shows CS server info',
		execute: execute
	};
};
