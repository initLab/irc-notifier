'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo, sender, text) {
		utils.xonStatus.sendGameStatus(config, ircbot, utils, replyTo);
	}
	
	return {
		key: 'xon',
		description: 'shows Xonotic server info',
		execute: execute
	};
};
