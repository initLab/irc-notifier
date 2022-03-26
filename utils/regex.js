'use strict';

function matchAll(regex, data) {
	if (regex.constructor !== RegExp) {
		throw new Error('not RegExp');
	}

	let matches = [];

	if (regex.global) {
		let match;

		do {
			match = regex.exec(data);

			if (match) {
				matches.push(match);
			}
		}
		while (match);
	}
	else {
		const match = regex.exec(data);

		if (match) {
			matches.push(match);
		}
	}

	return matches;
}

module.exports = {
    matchAll
};
