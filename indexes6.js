import Rosetta from './es6lib/rosettaCore.js';

require('./es6lib/shims.js');
var readyRE = /complete/;

function ready(callback) {
    if (readyRE.test(document.readyState) && document.body) {
        callback();
    } else {
        if (!document.addEventListener) {
            window.attachEvent('onload', callback);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                callback();
            }, false);
        }
    }
}

window.Rosetta = Rosetta;

ready(Rosetta.render);
