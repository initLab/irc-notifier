#!/usr/bin/env node

'use strict';

const irc = require('irc');
const fs = require('fs');
const requireDir = require('require-dir');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const ircbot = new irc.Client(
	config.irc.server,
	config.irc.nickname,
	config.irc.options
);

const utils = requireDir('utils');
const modules = requireDir('modules');

Object.keys(modules).forEach(function(key) {
	modules[key](ircbot, config, utils);
});
