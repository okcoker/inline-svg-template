var path = require('path');
var CLASSNAME = '{CLASSNAME}';

// Template must contain {IST_SVG}
var template = [
    '/**',
    ' * Generated by react-svg-component',
    ' */',
    '',
    '\'use strict\'',
    '',
    'import React from \'react\';',
    '',
    'class ' + CLASSNAME + ' extends React.Component {',
    '    constructor(props) {',
    '        super(props);',
    '    }',
    '',
    '    render() {',
    '        return (',
    '            {IST_SVG}',
    '        );',
    '    }',
    '}',
    '',
    'export default ' + CLASSNAME + ';'
].join('\n');

/**
 * React doesnt like certain attributes within the SVG when
 * used within jsx
 * @param  {String} svg
 * @return {String}
 */
function removeProblematicSvgAttributes(svg) {
    var parsed = svg;
    var replace = [
        // xmlns
        svg.match(/ xmlns:xlink="([^"]*)"/),
        // xml:space
        svg.match(/ xml:space="([^"]*)"/)
    ];

    replace.forEach(function(match) {
        if (match) {
            parsed = parsed.replace(new RegExp(match[0], 'g'), '');
        }
    });

    return parsed;
}

/**
 * Parse SVG contents before SVG is inserted into template
 * @param  {String} contents SVG contents to be inserted
 * @return {String}          Parsed SVG contents
 */
var parse = function(contents) {
    var svg = '<svg';
    var svg_part = contents.split(svg)[1];

    if (!svg_part) {
        console.log('Something wrong with this svg.');
        return contents;
    }

    // Spread props to component
    svg += ' { ...this.props } ';
    svg += svg_part;

    svg = removeProblematicSvgAttributes(svg);

    return svg;
};

var camelCaseClass = function(str) {
    var formatted = str.replace(/^([A-Z])|[\s-_](\w)/g, function(match, p1, p2) {
        if (p2) {
            return p2.toUpperCase();
        }
        return p1.toLowerCase();
    });

    return formatted.charAt(0).toUpperCase() + formatted.substr(1);
};

/**
 * Optional replacement functions keyed by the string to replace. The string
 * key will be passed to a global RegExp constructor. Each function will be passed
 * the current template contents and filepath. It should return the string to
 * replace the key with. Order matters.
 * @type {Object}
 */
var replacements = {
    '{CLASSNAME}': function(contents, filepath) {
        var basePath = path.basename(filepath, '.svg');
        return camelCaseClass(basePath);
    }
};

module.exports = {
    template: template,
    parse: parse,
    replacements: replacements
};