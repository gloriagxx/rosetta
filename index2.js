var es5shim = require('./lib2/es5-shim.js'),
    ieshim = require('./lib2/ie-shim.js'),

    Rosetta = require('./lib2/rosetta.js'),

    readyRE = /complete/,
    ready = function(callback) {
        if (readyRE.test(document.readyState) && document.body) {
            callback();
        } else {
            if (!document.addEventListener) {
                window.attachEvent('onload', callback);
            } else {
                document.addEventListener('DOMContentLoaded', function() {
                    callback();
                }, false);
            }
        }
    };

window.Rosetta = Rosetta;

ready(Rosetta.init);
