#!/usr/bin/env node

'use strict';

const irc = require('irc');
const requireDir = require('require-dir');
const utils = requireDir('utils');

const config = utils.file.readJson('config.json');

const ircbot = new irc.Client(
	config.irc.server,
	config.irc.nickname,
	config.irc.options
);

const modules = requireDir('modules');

Object.keys(modules).forEach(function(key) {
	modules[key](ircbot, config, utils);
});
