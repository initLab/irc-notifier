'use strict';

module.exports = function(dir, modulesConfig) {
	const Path = require('path');
	const rootDir = Path.dirname(require.main.filename);

	let result = {};

	for (let moduleName in modulesConfig) {
		const moduleConfig = modulesConfig[moduleName];

		if (!moduleConfig) {
			continue;
		}

		try {
			let args = Array.prototype.slice.call(arguments, 2);
			args.unshift(moduleConfig);
			console.log('Loading ' + dir + '/' + moduleName + '.js');
			result[moduleName] = require(rootDir + '/' + dir + '/' + moduleName + '.js').apply(this, args);
		}
		catch (e) {
			console.warn(e);
		}
	}

	return result;
};
