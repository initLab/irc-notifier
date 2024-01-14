'use strict';

module.exports = function(config, ircbot) {
	function addZWSP(str) {
		if (!str) {
			return str;
		}

		return str.substring(0, 1) + '\u200b' + str.substring(1);
	}

	const ACTIONS = {
		open: 'opened',
		lock: 'locked',
		unlock: 'unlocked',
	};

	ircbot.on('mqttMessage', function (topic, payload) {
		if (!topic.startsWith(config.topicPrefix)) {
			return;
		}

		const data = JSON.parse(payload.toString());
		const username = addZWSP(data?.user?.username) || 'Someone who does not wish to be named';
		const actionIndex = data?.action?.indexOf('_');
		const action = data?.action?.substring(0, actionIndex > -1 ? actionIndex : undefined);
		const actionVerb = ACTIONS[action] || action;
		const deviceName = data?.device?.name?.en || data?.device?.id || 'an unidentified device';

		ircbot.notice(config.channel, username + ' ' + actionVerb + ' the ' + deviceName);
	});

	ircbot.emit('mqttSubscribe', config.topicPrefix + '+/action/+');
};
