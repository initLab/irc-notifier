'use strict';

const fs = require('fs');

function readJson(path) {
	return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function writeJson(path, obj) {
	fs.writeFileSync(path, JSON.stringify(obj));
}

module.exports = {
	readJson: readJson,
	writeJson: writeJson
};
