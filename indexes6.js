require('./lib/shims.js');
var Rosetta = require('./lib/rosetta.js');
var readyRE = /complete/;

function ready(callback) {
    if (readyRE.test(document.readyState) && document.body) {
        callback();
    } else {
        if (!document.addEventListener) {
            window.attachEvent('onload', callback);
        } else {
            document.addEventListener('DOMContentLoaded', ()=> {
                callback();
            }, false);
        }
    }
}

window.Rosetta = Rosetta;

ready(Rosetta.render);