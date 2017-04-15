'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo) {
		utils.request.getJson('http://graphite.initlab.org/render/?target=apc.snmp.*&format=json&from=-3h', function(data) {
			var lastValues = {};
			var statusChanges = [];
			
			data.forEach(function(item) {
				var datapoints = item.datapoints.filter(function(point) {
					return point[0] !== null;
				});
				
				var key = item.target.substr(item.target.lastIndexOf('.') + 1);
				lastValues[key] = datapoints[datapoints.length - 1];
				
				if (key === 'voltage-input') {
					var lastState;
					
					datapoints.forEach(function(point, idx) {
						var isOnline = point[0] > 0;
						
						if (idx === 0 || lastState !== isOnline) {
							lastState = isOnline;
							statusChanges.push(point);
						}
					});
				}
			});
			
			var sinceText = '';
			
			if (statusChanges.length > 1) {
				var ts = statusChanges[statusChanges.length - 1][1];
				sinceText = ' since ' + utils.time.formatDateTimeShort(ts * 1000) +
				' (' + utils.time.formatTimePeriod(Math.floor(Date.now() / 1000) - ts, true) + ')';
			}
			
			ircbot.say(replyTo, 
				'Mains power: ' + (lastValues['voltage-input'][0] ? 'ONLINE' : 'OFFLINE') +
				sinceText +
				', battery left: ' + lastValues['percent-charge-battery'][0] + '%' +
				' (' + utils.time.formatTimePeriod(Math.floor(lastValues['timeleft-battery'][0] / 100), true) + ')' +
				', output load: ' + lastValues['percent-load-output'][0] + '%' +
				', battery temperature: ' + lastValues['temperature-battery'][0] + '°C'
			);
		}, function(error) {
			ircbot.say(replyTo, error);
		});
	}
	
	return {
		key: 'power',
		description: 'shows power status',
		execute: execute
	};
};
