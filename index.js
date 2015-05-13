var Rosetta = require('./lib/rosetta.js'),

    readyRE = /complete|loaded|interactive/,
    ready = function(callback) {
        if (readyRE.test(document.readyState) && document.body) {
            callback();
        } else document.addEventListener('DOMContentLoaded', function() {
            callback();
        }, false)
        return this
    };

window.Rosetta = Rosetta;

ready(Rosetta.init);