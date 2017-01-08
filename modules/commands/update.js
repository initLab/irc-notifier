'use strict';

module.exports = {
	key: 'update',
	description: 'updates the bot',
	execute: function(ircbot, config, utils, from, to, message, commands) {
		const child_process = require('child_process');

		let needsUpdate = true;
		
		const git = child_process.spawn('git', ['pull', '--ff-only'], {
			shell: true
		});
		
		git.stdout.on('data', (data) => {
			ircbot.say(to, data);
			
			if (data.toString() === 'Already up-to-date.\n') {
				needsUpdate = false;
			}
		});

		git.stderr.on('data', (data) => {
			ircbot.say(to, data);
		});
		
		git.on('close', (code) => {
			if (code !== 0) {
				ircbot.say(to, `Failed to update: child process exited with code ${code}`);
				return;
			}
			
			if (!needsUpdate) {
				return;
			}
			
			if ('process' in config && 'startupScript' in config.process) {
				ircbot.say(to, 'Updated successfully, restarting...');
				
				setTimeout(function() {
					const newInstance = child_process.spawn(config.process.startupScript, {
						stdio: 'ignore',
						detached: true
					});
					
					newInstance.unref();
					process.exit();
				}, 1000);
			}
			else {
				ircbot.say(to, 'Updated successfully, please restart.');
			}
		});
		
		git.on('error', (err) => {
			ircbot.say(to, `Failed to update: ${err}`);
		});
	}
};
