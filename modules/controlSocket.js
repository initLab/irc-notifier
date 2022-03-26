'use strict';

module.exports = function(config, ircbot, utils) {
	const logger = utils.logger.log;

	if (!('path' in config) && !('port' in config)) {
		logger('Starting without control socket, because neither path nor port were provided');
		return;
	}

	function commandCallback(line) {
		let args = line.split(' ');
		let cmd = args.shift().toLowerCase();

		let argsOptional = false;
		let knownCmd = true;
		let sendCmd = true;

		switch (cmd) {
			case 'quote':
				cmd = 'send';
			// noinspection FallThroughInSwitchStatementJS
			case 'send':
				// no need to modify args
			break;
			case 'join':
				args = [
					args.slice(0, 2).join(' ')
				];
			break;
			case 'part':
				args.splice(1, args.length - 1, args.slice(1).join(' '));
			break;
			case 'say':
			case 'action':
			case 'notice':
				args.splice(1, args.length - 1, args.slice(1).join(' '));
			break;
			case 'ctcp':
				args.splice(2, args.length - 2, args.slice(2).join(' '));
			break;
			case 'whois':
				args.splice(1, args.length - 1);
			break;
			case 'list':
				argsOptional = true;
			break;
			case 'connect':
			case 'activateFloodProtection':
				argsOptional = true;

				if (0 in args) {
					args = [
						parseInt(args[0])
					];
				}
			break;
			case 'disconnect':
				if (!ircbot.conn) {
					sendCmd = false;
					break;
				}

				argsOptional = true;
				const message = args.join(' ');

				if (message.length) {
					args = [
						message
					];
				}
				else {
					args = [];
				}
			break;
			default:
				sendCmd = false;

				switch (cmd) {
					case 'exit':
						if (ircbot.conn) {
							ircbot.disconnect('Exiting by control socket request', function() {
								process.exit();
							});
						}
						else {
							process.exit();
						}
					break;
					default:
						knownCmd = false;
					break;
				}
			break;
		}

		if (knownCmd) {
			logger('CMD: got CMD', cmd, 'ARGS', args);

			if (sendCmd) {
				if (args.length === 0 && !argsOptional) {
					logger('CMD: not enough arguments');
					return;
				}

				ircbot[cmd].apply(ircbot, args);
			}
		}
		else {
			logger('CMD: unknown CMD', cmd, 'ARGS', args);
		}
	}

	new utils.commandSocket.Socket(config, commandCallback);
};
