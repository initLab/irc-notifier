'use strict';

module.exports = function(config, ircbot, utils) {
	function execute(replyTo) {
		const child_process = require('child_process');

		let needsUpdate = true;

		const git = child_process.spawn('git', ['pull', '--ff-only', '--no-stat'], {
			shell: true
		});

		git.stdout.on('data', (data) => {
			if (data.toString().match(/^Already up[ -]to[ -]date.\n$/)) {
				needsUpdate = false;
				ircbot.say(replyTo, data);
			}
			else {
				ircbot.say(replyTo, data);
			}
		});

		git.stderr.on('data', (data) => {
			ircbot.say(replyTo, data);
		});

		git.on('close', (code) => {
			if (code !== 0) {
				ircbot.say(replyTo, `Failed to update: child process exited with code ${code}`);
				return;
			}

			if (!needsUpdate) {
				return;
			}

			if ('restartCommand' in config) {
				ircbot.say(replyTo, 'Updated successfully, restarting...');

				setTimeout(function() {
					const newInstance = child_process.spawn(config.restartCommand, {
						stdio: 'ignore',
						detached: true
					});

					newInstance.unref();
				}, 1000);
			}
			else {
				ircbot.say(replyTo, 'Updated successfully, please restart.');
			}
		});

		git.on('error', (err) => {
			ircbot.say(replyTo, `Failed to update: ${err}`);
		});
	}

	return {
		key: 'update',
		description: 'updates the bot',
		execute: execute
	};
};
