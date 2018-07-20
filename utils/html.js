'use strict';

function decodeEntities(encodedString) {
    const translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    const translate = {
        nbsp: ' ',
        amp: '&',
        quot: '"',
        lt: '<',
        gt: '>'
    };
    return encodedString.replace(translate_re, function(match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function(match, numStr) {
        const num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}

module.exports = {
	decodeEntities: decodeEntities
};
