module.exports = function(ircbot) {
	ircbot.addListener('raw', function(message) {
		switch (message.rawCommand) {
			case '704':
			case '705':
			case '706':
				console.log(message.args[2]);
			break;
		}
	});
};
