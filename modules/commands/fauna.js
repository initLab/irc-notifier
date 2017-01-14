'use strict';

const authStateFile = 'fauna_oauth2_state.json';

let oauth2;
let authState = {};

function saveAuthState(utils) {
	let state = {};
	
	Object.keys(authState).forEach(function(key) {
		if ('token' in authState[key]) {
			state[key] = authState[key].token;
		}
		else {
			state[key] = authState[key];
		}
	});
	
	utils.file.writeJson(authStateFile, state);
}

function setAccessToken(ircbot, utils, sender, accountName, token) {
	authState[accountName] = {
		token: token
	};
	
	saveAuthState(utils);

	ircbot.notice(sender, 'Authorization successful!');
}

function getAccountName(ircbot, sender, callback) {
	ircbot.remoteWhois(sender, function(info) {
		if (!('secure_connection' in info)) {
			ircbot.notice(sender, sender + ': This command only works over secure IRC connections');
			return;
		}

		if (!('account' in info)) {
			ircbot.notice(sender, sender + ': You are not logged in to IRC services. Please login and retry.');
			return;
		}

		callback(info.account);
	});
}

function getAuthURL(config, utils, sender, accountName, callback) {
	const crypto = require('crypto');
	let authParams = config.fauna.oauth2.authParams;

	crypto.randomBytes(32, (err, buf) => {
		if (err) {
			throw err;
		}

		let state = buf.toString('hex');

		authState[accountName] = {
			state: state,
			currentNickname: sender
		};
		
		saveAuthState(utils);

		authParams.state = state;

		callback(oauth2.authorizationCode.authorizeURL(authParams));
	});
}

function checkUserToken(ircbot, utils, sender, callbackFound, callbackNotFound) {
	getAccountName(ircbot, sender, function(accountName) {
		if (!(accountName in authState) || !('token' in authState[accountName])) {
			return callbackNotFound(accountName);
		}

		let token = authState[accountName].token;

		if (token.expired()) {
			ircbot.notice(sender, 'Your token has expired, trying to refresh...');

			return token.refresh((error, token) => {
				setAccessToken(ircbot, utils, sender, accountName, token);
				callbackFound(token, accountName);
			});
		}

		return callbackFound(token, accountName);
	});
}

function getUserToken(ircbot, config, utils, sender, callback) {
	checkUserToken(ircbot, utils, sender, callback, function(accountName) {
		return getAuthURL(config, utils, sender, accountName, function(authorizationURL) {
			ircbot.notice(sender, 'To use this bot, please link your IRC account with Fauna here: ' + authorizationURL);
			
			if (config.fauna.oauth2.authParams.redirect_uri === 'urn:ietf:wg:oauth:2.0:oob') {
				ircbot.notice(sender, 'After you receive the code, please enter it using the following command: /msg ' + ircbot.nick + ' !fauna auth <your code here>');
			}
		});
	});
}

function getAccessToken(ircbot, config, utils, sender, accountName, code) {
	oauth2.authorizationCode.getToken({
		code: code,
		redirect_uri: config.fauna.oauth2.authParams.redirect_uri
	}, (error, result) => {
		if (error) {
			return ircbot.notice(sender, 'Access Token Error: ' + error.message);
		}

		const token = oauth2.accessToken.create(result);

		setAccessToken(ircbot, utils, sender, accountName, token);
	});
}

function auth(ircbot, config, utils, sender, code) {
	getAccountName(ircbot, sender, function(accountName) {
		getAccessToken(ircbot, config, utils, sender, accountName, code);
	});
}

function deauth(ircbot, utils, sender) {
	checkUserToken(ircbot, utils, sender, function(token, accountName) {
		token.revoke('access_token', (error) => {
			if (error) {
				ircbot.notice(sender, 'Error revoking access token: ' + error.message);
				return;
			}

			token.revoke('refresh_token', (error) => {
				if (error) {
					ircbot.notice(sender, 'Error revoking refresh token: ' + error.message);
					return;
				}

				delete authState[accountName];
				saveAuthState(utils);
				
				ircbot.notice(sender, 'Access tokens revoked successfully');
			});
		});
	}, function() {
		ircbot.notice(sender, 'You are not authorized, so there\'s nothing to revoke');
	});
}

function executeCommand(ircbot, config, utils, sender, cmd) {
	getUserToken(ircbot, config, utils, sender, function(token, accountName) {
		utils.request.postOAuth2(config.fauna.urls.actions.door, {
			door_action: {
				name: cmd
			}
		}, token.token.access_token, function() {
			ircbot.notice(sender, 'Action ' + cmd + ' successful');
		}, function(error) {
			ircbot.notice(sender, 'Failed executing action: ' + error);
		});
	});
}

function showHelp(ircbot, replyTo) {
	ircbot.say(replyTo, 'Subcommands list: open/lock/unlock - control door, deauth - revoke tokens, info - show your account info, help - show this help');
}

function showInfo(ircbot, config, utils, sender) {
	getUserToken(ircbot, config, utils, sender, function(token, accountName) {
		utils.request.getJsonOAuth2(config.fauna.urls.resourceOwner, token.token.access_token, function(data) {
			ircbot.notice(sender, 'You are logged in to IRC as ' + accountName + ' and have linked the following Fauna account:');
			ircbot.notice(sender, 'Username: ' + data.username + ', Name: ' + data.name + ', Roles: ' + (data.roles.join(', ') || '<none>'));
		}, function(error) {
			ircbot.notice(sender, 'Failed getting user info: ' + error);
		});
	});
}

function showInvalidCommand(ircbot, replyTo) {
	ircbot.say(replyTo, 'Invalid subcommand, try !fauna help');
}

module.exports = {
	key: 'fauna',
	description: 'interacts with init Lab\'s fauna',
	init: function(ircbot, config, utils, next) {
		oauth2 = require('simple-oauth2').create(config.fauna.oauth2.credentials);
		
		try {
			let state = utils.file.readJson(authStateFile);

			Object.keys(state).forEach(function(key) {
				if ('token' in state[key]) {
					authState[key] = {
						token: oauth2.accessToken.create(state[key].token)
					};
				}
				else {
					authState[key] = state[key];
				}
			});
		}
		catch (e) {
			console.log(e);
		}
		
		new utils.httpServer.Server(config.fauna.http, function(error) {
			if (error) {
				console.log(error);
			}

			next();
		}, function(dispatcher) {
			dispatcher.onGet('/oauth/fauna/callback', function(req, res) {
				const URL = require('url');
				const QS = require('querystring');

				const url = URL.parse(req.url);
				const query = QS.parse(url.query);
				
				if (!('code' in query) || !('state' in query)) {
					res.writeHead(400, {
						'Content-Type': 'text/plain'
					});

					res.end('Missing request parameters');
					return;
				}
				
				let accountName;
				
				Object.keys(authState).forEach(function(key) {
					if (accountName) {
						return;
					}
					
					if (!('state' in authState[key])) {
						return;
					}

					if (authState[key].state !== query.state) {
						return;
					}
					
					accountName = key;
				});
				
				if (accountName) {
					const userState = authState[accountName];
					
					getAccessToken(ircbot, config, utils, userState.currentNickname, accountName, query.code);
					
					res.writeHead(200, {
						'Content-Type': 'text/plain'
					});

					res.end('Authorization successful! You can close this page.');
					return;
				}

				res.writeHead(400, {
					'Content-Type': 'text/plain'
				});

				res.end('Authorization state not valid. Please retry.');
			});
		});
	},
	execute: function(ircbot, config, utils, replyTo, sender, text) {
		const authPrefix = 'auth ';
		if (text.indexOf(authPrefix) === 0) {
			auth(ircbot, config, utils, sender, text.substr(authPrefix.length));
			return;
		}

		switch (text) {
			case 'deauth':
				deauth(ircbot, utils, sender);
				break;
			case 'open':
			case 'lock':
			case 'unlock':
				executeCommand(ircbot, config, utils, sender, text);
				break;
			case 'help':
				showHelp(ircbot, replyTo);
				break;
			case 'info':
			case '':
				showInfo(ircbot, config, utils, sender);
				break;
			default:
				showInvalidCommand(ircbot, replyTo);
				break;
		}
	}
};
