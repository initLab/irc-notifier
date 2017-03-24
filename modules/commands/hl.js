'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo, sender, text) {
		utils.hldsStatus.sendGameStatus(config, ircbot, utils, replyTo);
	}
	
	return {
		key: 'hl',
		description: 'shows HL server info',
		execute: execute
	};
};
