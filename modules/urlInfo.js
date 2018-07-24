'use strict';

const { URL } = require('url');
const iconv = require('iconv-lite');

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
		const match = regex.exec(text);
		
		if (match) {
			matches.push(match);
		}
	}
	
	return matches;
}

function matchCharsetInCt(contentType) {
	const ctParts = contentType.split(';').map(function(part) {
		return part.trim();
	});

	const csPrefix = 'charset=';
	
	for (let i = 0; i < ctParts.length; i++) {
		const part = ctParts[i].toLowerCase();

		if (part.indexOf(csPrefix) > -1) {
			return part.substr(csPrefix.length);
		}
	}
}

function parseCharset(data, headers) {
	// https://www.w3.org/TR/html401/charset.html#h-5.2.2
	
	// detect by header
	if ('content-type' in headers) {
		const headerCharset = matchCharsetInCt(headers['content-type']);
		
		if (headerCharset) {
			return headerCharset;
		}
	}
	
	// detect by meta tag
	const regex = /<meta [^>]*?\/?>/ig;
	const matches = matchAll(regex, data);
	let httpEquivCharset, metaCharset;
	
	for (let i = 0; i < matches.length; i++) {
		const tag = matches[i][0].toLowerCase();
		
		// <meta http-equiv="Content-Type" content="text/html; charset=xxx">
		if (tag.indexOf(' http-equiv="content-type"') > -1) {
			const metaMatch1 = tag.match(/content="([^"]*)"/);
			
			if (metaMatch1) {
				httpEquivCharset = matchCharsetInCt(metaMatch1[1]);
				continue;
			}
		}

		// <meta charset="xxx">
		const metaMatch2 = tag.match(/charset="([^"]*)"/);
		
		if (metaMatch2) {
			metaCharset = metaMatch2[1];
			continue;
		}

	}
	
	if (httpEquivCharset) {
		return httpEquivCharset;
	}
	
	if (metaCharset) {
		return metaCharset;
	}
	
	// assume utf-8
	return 'utf-8';
}

function decodeBuffer(data, headers) {
	const charset = parseCharset(data.toString('ascii'), headers);
	return iconv.decode(data, charset);
}

module.exports = function(config, ircbot, utils) {
	ircbot.addListener('message', function(from, to, message) {
		const parts = message.split(' ');

		for (let i = 0; i < parts.length; i++) {
			try {
				const urlObj = new URL(parts[i]);

				utils.request.getWithOptions(urlObj.href, {
					encoding: null
				}, function(data, headers) {
					const matches = decodeBuffer(data, headers).match(/<title ?.*?>([^<]*)<\/title>/i);
					
					if (matches && matches[1]) {
						// we have found a title element
						ircbot.say(to, '^ ' + utils.html.decodeEntities(matches[1].trim()) + ' ^');
					}
				}); // request errors are silently discarded
				
				// do not process more urls
				break;
			}
			catch (e) {
				// not a valid url
			}
		}
	});
};
