'use strict';

const fs = require('fs');

function readJson(path) {
	return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function writeJson(path, obj) {
	fs.writeFileSync(path, JSON.stringify(obj), {
		mode: 0o600
	});
}

module.exports = {
	readJson: readJson,
	writeJson: writeJson
};
