var fs = require('fs');
var colors = require('colors');
var path = require('path');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var SVGO = require('svgo');
var debug = require('debug')('ist');
var Promise = require('promise');

svgo = new SVGO();

var svgReplaceString = '{IST_SVG}';
var defaultTemplate = {
    parse: function(contents) {
        return contents;
    },
    replacements: {}
}

function mkdir(pathname) {
    return new Promise(function(resolve, reject) {
        mkdirp(pathname, function(err) {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    });
}

function readFile(file) {
    return new Promise(function(resolve, reject) {
        fs.readFile(file, 'utf8', function(err, data) {
            if (err) {
                reject(err);
                return;
            }

            resolve(data);
        });
    });
}

function writeFile(filepath, contents) {
    var pathname = path.dirname(filepath);
    return mkdir(pathname).then(function() {
        return new Promise(function(resolve, reject) {
            fs.writeFile(filepath, contents, 'utf8', function(err) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    });
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function validateTemplateConfig(config) {
    assert(config.template, 'No template found in config');
}

function cleanDir(dir) {
    return new Promise(function(resolve, reject) {
        rimraf(dir, function(err) {
            if (err) {
                console.log(colors.red('File path', options.output, 'couldn\'t be cleaned.'));
                reject(err);
                return;
            }

            resolve();
        });
    });
}

function optimizeSvg(svg) {
    return new Promise(function(resolve, reject) {
        svgo.optimize(svg, function(result) {
            var data = result.data;

            if (result.error) {
                reject(error);
                return;
            }

            resolve(data);
        });
    });
}

function ist(files, templateConfig, options) {
    var promise = Promise.resolve();
    var parse = templateConfig.parse || defaultTemplate.parse;
    var replacements = templateConfig.replacements || defaultTemplate.replacements;
    var template = templateConfig.template;

    validateTemplateConfig(templateConfig);

    if (options.clean) {
        if (!options.output) {
            console.log(colors.red('Input directory can not be the same as output directory when clean option is true.'));
            return;
        }

        promise = promise.then(function() {
            return cleanDir(options.output + '/*');
        });
    }

    debug('Processing files: \n' + files.join('\n'));
    var operations = files.map(function(file) {
        var basename = path.basename(file, '.svg');
        var destination = options.output || path.dirname(file);
        var outputFile = destination + '/' + basename + options.ext;

        debug('Reading file ' + file);

        return readFile(file).then(function(svg) {
            if (options.svgo) {
                debug('Optimizing using svgo…');
                return optimizeSvg(svg);
            }

            return svg;
        }).then(function(svg) {
            debug('Parsing svg using template config parse function…');
            var parsed = parse(svg);

            assert(parsed, 'No value returned from template parse function.');

            return parsed;
        }).then(function(parsedSvg) {
            debug('Generating template with parsed SVG…');
            var svgRegex = new RegExp(svgReplaceString, 'g');
            var parsedTemplate = template.replace(svgRegex, parsedSvg);

            debug('Running replacement functions…');
            Object.keys(replacements).forEach(function(key) {
                debug('Replacement function with key: ' + key);
                var regex = new RegExp(key, 'g');
                var fn = replacements[key];
                var replacement = fn(parsedTemplate, file);

                parsedTemplate = parsedTemplate.replace(regex, replacement);
            });

            assert(parsedTemplate, 'Parsed template seems to be empty');
            return parsedTemplate;
        }).then(function(template) {
            debug('Writing file: ' + outputFile);
            return writeFile(outputFile, template);
        });

    });

    return promise.then(function() {
        return Promise.all(operations);
    });
};

module.exports = ist;
