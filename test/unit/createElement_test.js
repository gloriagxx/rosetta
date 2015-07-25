var createElementClass = require('../../lib/createElementClass.js');
var test = require('tape');
require('../../lib/shims.js');

test('', function (t) {
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

    t.equal()

});