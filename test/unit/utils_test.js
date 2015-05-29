var utils = require('../../lib/utils.js');
var test = require('tape');
require('../../lib/ie-shim.js');
require('../../lib/es5-shim.js');


test('utils objToString test', function(t) {
    t.plan(5);

    var rjson = utils.objToString({
            a: 'sdsd',
            b: [1, 2, 4, {b: 'dd', c:[3, 2, 4]}]
        });

    t.equal(rjson, "{a:'sdsd',b:[1,2,4,{b:'dd',c:[3,2,4]}]}");

    var rarray = utils.objToString([{
            a:"sdfsd",
            b:[1,2,3,4,{c:2}]
        }, "ddd", {"dfdf":{bbbb:"dfd"}}])

    t.equal(rarray, '[{a:\'sdfsd\',b:[1,2,3,4,{c:2}]},\'ddd\',{dfdf:{bbbb:\'dfd\'}}]');


    var rstring = utils.objToString('dfsasdfs');
    t.equal(rstring, '\'dfsasdfs\'');


    var rfunc = utils.objToString(function(){alert(1);});
    t.equal(typeof rfunc, 'string');


    var rspe = utils.objToString('&nbsp');
    t.equal(rspe, '\'&nbsp\'');
});


test('utils toType test', function(t) {
    t.plan(2);

    var rjson = utils.toType('{"a":"sdsd","b":[1,2,4,{"b":"dd","c":[3,2,4]}]}');

    t.deepEqual(rjson, { a: 'sdsd', b: [ 1, 2, 4, { b: 'dd', c: [ 3, 2, 4 ] } ] });


    var rarray = utils.toType('[{"a":"sdfsd", "b":[1,2,3,4,{"c":2}]}, "ddd", {"dfdf":{"bbbb":"dfd"}}]');

    t.deepEqual(rarray, [{"a":"sdfsd", "b":[1,2,3,4,{"c":2}]}, "ddd", {"dfdf":{"bbbb":"dfd"}}]);

});

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