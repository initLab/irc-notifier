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
    }).replace(/&#(x)?(\d+);/gi, function(match, isHex, numStr) {
        const num = parseInt(numStr, isHex ? 16 : 10);
        return String.fromCharCode(num);
    });
}

module.exports = {
	decodeEntities: decodeEntities
};
