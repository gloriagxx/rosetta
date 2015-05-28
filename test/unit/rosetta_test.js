var Rosetta = require('../../lib/rosetta.js');
var test = require('tape');


test('', function(t) {
    t.plan(1);

    Rosetta.register('r-tabs', function (tag) {
        var __m = arguments[0];
        __m.__t = function tmpl(tag, attrs, refs) {
            return tag.create('div', { 'class': tag.type }, tag.create('ul', {
                'class': 'nav',
                'ref': 'ul'
            }, (attrs.items || []).map(function (item, index) {
                var clsName = '';
                if (attrs.index === index) {
                    clsName = 'r-state-active';
                }
                return tag.create('li', { 'class': clsName }, tag.create('a', { 'href': 'javascript:void(0);' }, item.title || ''));
            })), tag.create('div', {
                'ref': 'viewport',
                'class': 'r-viewport content'
            }, (attrs.items || []).map(function (item, index) {
                var clsName = 'panel';
                if (attrs.index === index) {
                    clsName += ' r-state-active';
                }
                return tag.create('div', { 'class': clsName }, item.content ? item.content : tag.create('content', { 'selector': item.selector }));
            })), tag.create('r-sample', { 'list': '[1,2,3]' }));
        };
        var attrs = tag.attrs = {
            index: 0,
            items: [
                {
                    title: '\u9009\u9879\u53611',
                    content: '\u5185\u5BB91'
                },
                {
                    title: '\u9009\u9879\u53612',
                    content: '\u5185\u5BB92'
                }
            ],
            event: function () {
                alert(1);
            }
        };
        tag.switchTo = function (index) {
            index = index % attrs.items.length;
            if (index === attrs.index) {
                return;
            }
            console.log('switch to %d', index);
            tag.update({ index: index });
            $(tag.refs.ul).children().removeClass('r-state-active').eq(index).addClass('r-state-active');
            $(tag.refs.viewport).children().removeClass('r-state-active').eq(index).addClass('r-state-active');
            attrs.index = index;
        };
        function onAttached() {
            $(tag.refs.ul).on('click', 'li', function () {
                tag.switchTo($(this).index());
                return false;
            });
        }
        __m.on('attached', onAttached);
    });

    t.equal();
});




