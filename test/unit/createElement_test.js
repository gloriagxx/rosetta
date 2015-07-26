var createElementClass = require('../../lib/createElementClass.js');
var test = require('tape');
require('../../lib/shims.js');

test('test newClass', function (t) {
    t.plan(1);

    var options = {
        is: 'r-test',
        created: function() {

        },
        attached: function() {

        },
        properties: {
            list: Array,
            title: {
                type: String,
                value: 'sdsd'
            }
        }

    };

    var newClass = createElementClass(options);

    var rTest = new newClass({
        list: [1,2,4],
        title: 'aaaaa',
        sdsdfs: 'lalal'
    });

    t.equal(rTest.title, 'aaaaa');
});