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

utils.moduleLoader('modules', config.modules, ircbot, utils);
