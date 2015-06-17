var utils = require('../../lib/utils.js');
var test = require('tape');
require('../../lib/shims.js');


test('to plain array test', function(t) {
    t.plan(2);

    var rarray = utils.toPlainArray([[1,2,['aaa',222,'444']], 'sadad', 'aaa', [121,45]]);

    t.deepEqual(rarray, [1,2,'aaa',222,'444','sadad','aaa',121,45]);


    var rarray2 = utils.toPlainArray([1,2,'4']);
    t.deepEqual(rarray2, [1,2,'4']);

});


test('camelize test', function(t) {
    t.plan(1);

    var rstr = utils.camelize('r-sdsds');

    t.equal(rstr, 'rSdsds');
});