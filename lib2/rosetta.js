// how to deal with subElements lifecycle
// how to delegate event pf subElements

var _refers = {},
    _elemClass = {},
    _allRendered = false;

var supportEvent = require('./supportEvent.js'),
    utils = require('./utils.js'),
    isArray = utils.isArray,
    query = utils.query,
    toType = utils.toType,
    objToString = utils.objToString,
    extend = utils.extend,
    toPlainArray = utils.toPlainArray,
    isOriginalTag = utils.isOriginalTag,
    isDomNode = utils.isDomNode,
    isString = utils.isString,
    isFunction = utils.isFunction,
    bind = utils.bind,
    fire = utils.fire,

    lifeEvents = require('./lifeEvents.js'),
    ATTACHED = lifeEvents.ATTACHED,
    DETACHED = lifeEvents.DETACHED,
    CREATED = lifeEvents.CREATED
    ATTRIBUTECHANGE = lifeEvents.ATTRIBUTECHANGE;

var h = require('./virtual-dom/h'),
    createElement = require('./virtual-dom/create-element');

var Delegator = require('./dom-delegator');
var createElementClass = require('./createElementClass.js');

function init() {
    var elems = [];
    _allRendered = false;
    if (!!document.getElementsByClassName) {
        elems = document.getElementsByClassName('r-element');
    } else if (!!document.querySelectorAll) {
        elems = document.querySelectorAll('.r-element');
    } else {
        var doms = document.getElementsByTagName('*')
        for (var i = 0; i < doms.length; i++) {
            var item = doms[i];
            if (item.tagName.toLowerCase().indexOf('r-') >= 0) {
                elems.push(item);
            }
        }
    }

    for (var i = 0; i < elems.length; i++) {
        var item = elems[i],
            type = item.tagName.toLowerCase(),
            attrs = item.attributes,
            options = {};

        if (type.indexOf('r-') == 0) {
            var children = item.children,
                childrenArr = [].slice.call(children);

            for (var n = 0; n < attrs.length; n++) {
                var attr = attrs[n];
                options[attr.name] = attr.nodeValue;
            }

            var obj = Rosetta.render(Rosetta.create(type, options, childrenArr), item, true);

            ref(options.ref, obj);
        }
    }
    _allRendered = true;
    fire.call(Rosetta, 'ready');
}

function updatevNodeContent(vNodeFactory, contentChildren) {

}

function delegate(parent, child, type, cb) {
    var callback = function(event) {
        obj = event.srcElement ? event.srcElement : event.target;
        while(!!obj && obj != parent.parentElement) {
            if (obj == child) {
                cb(event);
                break;
            }
            obj = obj.parentElement;
        }
    };

    if (parent.addEventListener) {
        parent.addEventListener(supportEvent[type], callback, false);
    } else {
        parent.attachEvent('on' + supportEvent[type], callback);
    }
}

function ref(key, value) {
    if (!key) {
        return;
    }

    if (value != undefined) {
        _refers[key] = value;
    } else {
        return _refers[key];
    }
}

function elemClass(type, newClass) {
    if (newClass != undefined) {
        _elemClass[type] = newClass;
    } else {
        return _elemClass[type];
    }
}


function updateDom(obj) {
    for (var i in obj.attrs) {
        var item = obj.attrs[i];
        if (!supportEvent[i]) {
            if (!!item) {
                if (!isString(item)) {
                    item = objToString(item);
                }
            }
            obj.root.setAttribute(i, item || '');
        }
    }

    return obj;
}

function triggerChildren(obj, type) {
    (obj.rosettaElems || []).map(function(item, index) {
        triggerChildren(item.rosettaElems || []);

        item.trigger(type, item);
    });
}

function appendRoot(obj, root, force) {
    root.parentElement.replaceChild(obj.root, root);
    return obj;
}

function render(obj, root, force) {
    if (isString(root)) {
        root = query(root)[0];
    }

    var vTree = obj.isRosettaElem == true ? obj.vTree : obj;

    if (!vTree || !root) {
        return;
    }

    var dom = createElement(vTree);
    obj.root = dom;

    // obj = updateDom(obj);
    obj = appendRoot(obj, root, force);

    if (obj.isRosettaElem == true) {
        newClass = (dom.getAttribute('class') || '')? (dom.getAttribute('class') || '') + ' ' + obj.type : obj.type;

        dom.setAttribute('class', newClass.replace(/r-invisible/g, ''));

        obj.isAttached = true;

        triggerChildren(obj, ATTACHED);

        obj.trigger(ATTACHED, obj);
    }
    return obj;
    // dom and children events delegation
}

/**
 * Returns vTree of newly created element instance
 *
 * @method create
 * @return {Object} vTree
 */
function create(type, attr) {
    if (!isString(type)) {
        return;
    }

    attr = toType(attr || '') || {};

    var arr = [].slice.call(arguments, 2);
    var contentChildren = [];

    function parseContentChildren(arr) {
        arr.map(function(item, index) {
            if (isArray(item)) {
                parseContentChildren(item);
            } else {
                if (typeof item == 'number') {
                    contentChildren.push('' + item);
                } else if(item && item.isRosettaElem == true) {
                    contentChildren.push(item.vTree);
                } else {
                    contentChildren.push(item);
                }
            }
        });
        return contentChildren;
    }

    contentChildren = parseContentChildren(arr);
    if (isOriginalTag(type)) {
        var eventObj = {};
        for (var i in attr) {
            var item = attr[i];
            if (supportEvent[i]) {
                eventObj['ev-' + supportEvent[i]] = item;
                var delegator = Delegator();
                delegator.listenTo(supportEvent[i]);
            }
        }

        var newAttrs = extend({
            attributes: attr
        }, eventObj, true);


        var vTree = h.call(this, type, newAttrs, contentChildren);

        return vTree;
    } else {
        var NewClass = elemClass(type),
            elemObj = null;

        if (!NewClass) {
            return;
        }

        elemObj = new NewClass();

        elemObj.renderFunc(elemObj);
        elemObj.name = attr.ref ? attr.ref && ref(attr.ref, elemObj) : '';
        extend(elemObj.attrs, attr, true);

        var vTree = elemObj.__t(elemObj, elemObj.attrs, elemObj.refs);

        elemObj.vTree = vTree;
        elemObj.trigger(CREATED, elemObj);

        return elemObj;
    }
}


function register(type, renderFunc) {
    var newClass = createElementClass(type, renderFunc);

    elemClass(type, newClass);
    return newClass;
}

function ready(cb) {
    if (isFunction(cb)) {
        if (_allRendered == true) {
            cb();
        } else {
            bind.call(Rosetta, 'ready', cb);
        }
    }
}


var Rosetta = {
    init: init,

    ref: ref,

    elemClass: elemClass,

    render: render,

    create: create,

    register: register,

    ready: ready,

    triggerChildren: triggerChildren

};

module.exports = Rosetta;